import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "~/server/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import {
  determineBucketNameFromS3Key,
  parseFileExtensionFromS3Key,
} from "~/utils/utils";
import { Ratelimit } from "@upstash/ratelimit";
import redis from "~/utils/redis";
import { headers } from "next/headers";
import { TRPCClientError } from "@trpc/client";

const ratelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  limiter: Ratelimit.fixedWindow(25, "3 m"),
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
      const result = await ratelimit.limit(ipIdentifier ?? "");

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
      }

      throw new Error("User does not own the file");
    }),
});
