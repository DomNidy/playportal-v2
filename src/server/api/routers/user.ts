import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "~/server/aws-clients";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import {
  determineBucketNameFromS3Key,
  getURL,
  parseFileExtensionFromS3Key,
} from "~/utils/utils";
import { Ratelimit } from "@upstash/ratelimit";
import redis from "~/utils/redis";
import { cookies, headers } from "next/headers";
import { TRPCClientError } from "@trpc/client";
import {
  decryptYoutubeCredentials,
  getYoutubeChannelSummary,
  oAuth2Client,
  persistYoutubeCredentialsToDB,
  refreshYoutubeCredentials,
} from "~/utils/oauth/youtube";
import { CodeChallengeMethod, Credentials } from "google-auth-library";
import { supabaseAdmin } from "~/utils/supabase/admin";

// Used for rate limit getPresignedUrlForFile
const downloadRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  limiter: Ratelimit.fixedWindow(25, "3 m"),
});

// Used for rate limiting getUserVideos
const getUserVideosRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  limiter: Ratelimit.slidingWindow(50, "2 m"),
});

export const userRouter = createTRPCRouter({
  getUserVideos: protectedProcedure
    .input(
      z.object({
        cursor: z.number().nullish(), // the offset we'll use
        limit: z.number().min(1).max(100).nullish(), // the limit we'll use
      }),
    )
    .query(async ({ ctx, input }) => {
      const headersList = headers();
      const ipIdentifier = headersList.get("x-real-ip");
      const result = await getUserVideosRatelimit.limit(ipIdentifier ?? "");

      if (!result.success) {
        throw new TRPCClientError(
          `Please wait a few minutes before sending another request.`,
        );
      }

      const offset = input.cursor ?? 0;
      const limit = input.limit ?? 10;

      const { data } = await ctx.db
        .from("operations_filemetadata")
        .select("*")
        .eq("user_id", ctx.user.id)
        .eq("file_origin", "PlayportalBackend")
        .eq("file_type", "Video")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit);

      const nextCursor = (data?.length ?? 0) >= limit ? offset + limit : null;

      return {
        data,
        nextCursor: nextCursor,
      };
    }),

  // Generates an authorization url for the user to authenticate youtube access
  getYouTubeAuthorizationURL: protectedProcedure.query(async ({ ctx }) => {
    // We need to generate a code verifier and code challenge, then store the code verifier in a secure cookie
    const { codeChallenge, codeVerifier } =
      await oAuth2Client.generateCodeVerifierAsync();

    cookies().set("codeVerifier", codeVerifier);

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube",
      ],
      // The state param is encoded into the url and sent back to the callback
      // This will make it easy to identify the user that the token is associated with, and persist it to the db
      state: ctx.user.id,
      code_challenge_method: CodeChallengeMethod.S256,
      code_challenge: codeChallenge,
    });

    return {
      authUrl,
      codeVerifier,
    };
  }),

  // Allows a user to download files from the output or input bucket (if they own them)
  getPresignedUrlForFile: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const headersList = headers();
      const ipIdentifier = headersList.get("x-real-ip");
      const result = await downloadRatelimit.limit(ipIdentifier ?? "");

      if (!result.success) {
        throw new TRPCClientError(
          `Please wait a few minutes before sending another request.`,
        );
      }

      // Query db to check user owns the file pointed to by s3 key
      const fileData = await ctx.db
        .from("operations_filemetadata")
        .select("*")
        .eq("s3_key", input.s3Key)
        .eq("user_id", ctx.user.id)
        .single();

      const bucket = determineBucketNameFromS3Key(input.s3Key);

      // Determine what type of file the user is trying to download
      const requestedFileType = fileData.data?.file_type ?? "file";
      // Parse out the extension from the s3 key
      const fileExtension = parseFileExtensionFromS3Key(input.s3Key);

      const fileName = `${fileData.data?.video_title?.concat(` ${requestedFileType}`) ?? "your-file"}.${fileExtension}`;

      if (
        fileData.data?.s3_key === input.s3Key &&
        fileData.data.user_id === ctx.user.id
      ) {
        return getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucket,
            Key: input.s3Key,
            ResponseContentDisposition: `attachment; filename=${fileName}`,
          }),
          { expiresIn: env.S3_PRESIGNED_URL_DOWNLOAD_EXP_TIME_SECONDS },
        );
      } else if (fileData.data?.user_id !== ctx.user.id) {
        console.warn(
          `User ${ctx.user.id} attempted to download file that they do not own ${input.s3Key}`,
        );
        // Don't reveal that the user attempted to download a file they don't own (for security reasons)
        throw new TRPCClientError("File not found");
      }

      // If we're here, the file wasn't found
      console.warn(
        `User ${ctx.user.id} attempted to download file that does not exist ${input.s3Key}`,
      );
      throw new TRPCClientError("File not found");
    }),
  // Get connected accounts
  getConnectedYoutubeAccounts: protectedProcedure.query(async ({ ctx }) => {
    const { data: connectedAccounts, error } = await supabaseAdmin
      .from("oauth_creds")
      .select("*")
      .eq("service_name", "YouTube")
      .eq("user_id", ctx.user.id);

    if (error) {
      console.error("Error while trying to get connected accounts: ", error);
      throw new TRPCClientError(
        "Error occurred while trying to get connected YouTube accounts, please try again or contact support.",
      );
    }

    // From all the connected accounts, we only want the encrypted tokens
    const encryptedYoutubeTokens = connectedAccounts
      ?.filter((account) => account?.token)
      .map((account) => account.token as string);

    // TODO: If this occurs, we might want to notify the user
    if (encryptedYoutubeTokens.length !== connectedAccounts.length) {
      console.warn(
        "Some connected accounts did not have a token",
        connectedAccounts,
        encryptedYoutubeTokens,
      );
    }

    // Create an array of all decrypted credentials owned by the user
    const youtubeCredentialsArray: Credentials[] = encryptedYoutubeTokens
      .map((token) => {
        try {
          const decryptedCredentials = decryptYoutubeCredentials(token);

          return decryptedCredentials;
        } catch (error) {
          // TODO: If this happens, we failed to decrypt one of the credentials, we might want to notify the user here as well
          return null;
        }
      })
      .filter((credentials) => credentials !== null) as Credentials[];

    // For all retrieved credentials, we will refresh them, if any fail, we will remove them from the list
    // In case one of them fails, the user will need to re-authenticate that account
    const refreshedYoutubeCredentials = (await Promise.all(
      youtubeCredentialsArray.map(async (credentials) => {
        try {
          // Refresh the credentials if they expire soon or have already expired
          const refreshedCredentials =
            await refreshYoutubeCredentials(credentials);

          // If the token was refreshed, we need to update the database
          if (refreshedCredentials.expiry_date !== credentials.expiry_date) {
            console.log("Token was refreshed");

            const { channelAvatar, channelId, channelTitle } =
              await getYoutubeChannelSummary(credentials);

            await persistYoutubeCredentialsToDB(
              refreshedCredentials,
              ctx.user.id,
              channelId,
              channelAvatar ?? null,
              channelTitle,
            );
          }

          return refreshedCredentials;
        } catch (err) {
          // User will need to re-authenticate this account
          console.error("Error refreshing token", err);
          return null;
        }
      }),
    ).then((credentials) =>
      credentials.filter((cred) => cred !== null),
    )) as Credentials[];

    return null;
  }),
});
