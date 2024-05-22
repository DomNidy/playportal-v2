import { type Credentials, OAuth2Client } from "google-auth-library";
import { env } from "~/env";
import { getURL } from "../utils";
import { google } from "googleapis";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { supabaseAdmin } from "../supabase/admin";

export const youtube = google.youtube("v3");

export const oAuth2Client = new OAuth2Client({
  clientId: env.YOUTUBE_OAUTH_CLIENT_ID,
  clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET,
  redirectUri: `${getURL()}/api/oauth/youtube/callback`,
});

const algorithm = "aes-256-cbc";
const key = createHash("sha256")
  .update(String(env.OAUTH_TOKEN_ENCRYPTION_KEY))
  .digest();

/**
 * When provided a `Credentials` object, this function will return a base64 encoded string.
 * The `Credentials` object is a JSON object returned from the `getToken` method of the `OAuth2Client` object.
 * Contains the access token, refresh token, and expiry date, etc.
 * @param creds
 * @returns `base64Encoded(IV):base64Encoded(encryptedCredentials)`
 */
export function encryptYoutubeCredentials(credentials: Credentials) {
  /* The IV (initialization vector) is a random 16 byte buffer used to ensure that the same plaintext does not encrypt to the same ciphertext
   * It does this by XORing the plaintext with the IV before encrypting it (this is how CBC mode works), so each block is dependent on the previous block
   * This does not need to be kept secret, so it can be stored alongside the ciphertext in plain text, the benefit is that it is different for each encryption
   */
  const iv = randomBytes(16);

  // Stringify the credentials object
  const credentialsString = JSON.stringify(credentials);

  // Create the ciper with the randomly generated IV
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(credentialsString, "utf8", "base64");
  encrypted += cipher.final("base64");

  return iv.toString("base64") + ":" + encrypted;
}

/**
 * When provided an encrypted string, this function will return a `Credentials` object if the decryption is successful.
 * The encrypted string should be in the format `base64Encoded(IV):base64Encoded(encryptedCredentials)` (returned from `encryptYoutubeCredentials`)
 *
 */
export function decryptYoutubeCredentials(encrypted: string): Credentials {
  const [iv, encryptedCredentials] = encrypted
    .split(":")
    .map((str) => Buffer.from(str, "base64"));

  if (!iv || !encryptedCredentials) {
    console.error(
      "Invalid encrypted string format",
      `Parsed IV: ${iv?.toString("base64")}`,
      `Parsed ciphertext: ${encryptedCredentials?.toString("base64")}`,
    );
    throw new Error("Invalid encrypted string format");
  }

  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(
    encryptedCredentials.toString("base64"),
    "base64",
    "utf8",
  );
  decrypted += decipher.final("utf8");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const decryptedCredentials = JSON.parse(decrypted);

  // Check if the decrypted credentials match the expected shape
  if (
    !decryptedCredentials ||
    typeof decryptedCredentials !== "object" ||
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    !decryptedCredentials?.access_token
  ) {
    console.error(
      "Decrypted credentials do not match expected shape",
      decryptedCredentials,
    );
    throw new Error("Decrypted credentials do not match expected shape");
  }

  return decryptedCredentials as Credentials;
}

/*
 * This function simply encrypts a string, we mainly use this for the refresh token, since we store it in a separate column
 */
export function encryptString(input: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(input, "utf8", "base64");
  encrypted += cipher.final("base64");

  return iv.toString("base64") + ":" + encrypted;
}

/*
 * This function decrypts a string, we mainly use this for the refresh token, since we store it in a separate column
 */
export function decryptString(encrypted: string) {
  try {
    const [iv, encryptedString] = encrypted
      .split(":")
      .map((str) => Buffer.from(str, "base64"));

    if (!iv || !encryptedString) {
      console.error(
        "Invalid encrypted string format",
        `Parsed IV: ${iv?.toString("base64")}`,
        `Parsed ciphertext: ${encryptedString?.toString("base64")}`,
      );
      throw new Error("Invalid encrypted string format");
    }

    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(
      encryptedString.toString("base64"),
      "base64",
      "utf8",
    );
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error while trying to decrypt string: ", error);
    throw new Error("Error occurred while trying to decrypt string");
  }
}

export function validateYoutubeCredentialsSchema(credentials: Credentials) {
  if (
    !credentials ||
    typeof credentials !== "object" ||
    !credentials.access_token
  ) {
    console.error(
      "Invalid credentials object received",
      "Expected shape: { access_token: string, expiry_date: number, token_type: string }",
    );
    throw new Error("Invalid credentials object");
  }
}

/**
 * If the passed credentials object contains a refresh token, and the credentials are expired, this function will return a new `Credentials` object with a new access token.

 */
export async function refreshYoutubeCredentials(
  credentials: Credentials,
  channelID?: string,
) {
  try {
    let refreshToken = credentials.refresh_token ?? null;
    // We'll refresh the token if it will expire in this many seconds
    const expiryThresholdMS = 1000 * 60 * 3; // 3 minutes

    // Check that the credentials contain a refresh token, if they don't, we try to fetch it from the database
    if (!refreshToken) {
      // If the credentials do not contain a refresh token, and we do not have a channel ID, we cannot fetch the refresh token
      if (!channelID)
        throw new Error(
          "Supplied credentials do not contain a refresh token, and no channel ID was provided. We cannot refresh the token, and the user must re-authenticate this account.",
        );

      const { data: credsData, error } = await supabaseAdmin
        .from("oauth_creds")
        .select("refresh_token")
        .eq("service_account_id", channelID)
        .maybeSingle();

      if (error) {
        console.error("Error while trying to fetch refresh token: ", error);
        throw new Error("Error occurred while trying to fetch refresh token");
      }

      if (!credsData ?? !credsData?.refresh_token) {
        throw new Error("No refresh token found in database");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      refreshToken = decryptString(credsData.refresh_token);
    }

    // If expiry time will not be soon, return the same credentials
    if (
      credentials.expiry_date &&
      credentials.expiry_date - Date.now() > expiryThresholdMS
    ) {
      return credentials;
    }

    // We need to create a new OAuth2Client object to refresh the token
    // We do this because the main oAuth2Client object may be shared between multiple users, and if we set the credentials on it, it will be shared between all users
    const youtubeOAuthClient = new OAuth2Client({
      clientId: env.YOUTUBE_OAUTH_CLIENT_ID,
      clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET,
      redirectUri: `${getURL()}/api/oauth/youtube/callback`,
      credentials: {
        refresh_token: refreshToken,
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date,
        token_type: credentials.token_type,
        scope: credentials.scope,
        id_token: credentials.id_token,
      },
    });

    // If token will expire soon or is already expired, retrieve a new one
    const { credentials: newCredentials } =
      await youtubeOAuthClient.refreshAccessToken();

    validateYoutubeCredentialsSchema(newCredentials);

    return newCredentials;
  } catch (error) {
    // User will need to re-authenticate
    console.error("Error refreshing token", error);
    throw new Error("Error refreshing token");
  }
}

/*
 * When provided a `Credentials` object, and a user id, this function will store the credentials in the database, associating them with the user id.
 * Must also be provided with the id of the youtube account (service_account_id, this can be retrieved from the youtube API channels.list endpoint)
 */
export async function persistYoutubeCredentialsToDB(
  credentials: Credentials,
  userId: string,
  // The id of the youtube account
  youtubeChannelId: string,
  youtubeChannelImageUrl: string | null,
  youtubeChannelTitle: string | null,
) {
  console.log(
    "Trying to persisting credentials for channel: ",
    youtubeChannelId,
    " for user: ",
    userId,
    "to the database.",
  );

  try {
    // Encrypt the credentials
    const encryptedCredentials = encryptYoutubeCredentials(credentials);

    // Check if credentials has a refresh token, if it does, we should replace the refresh token stored in the database
    // First encrypt the refresh token
    const encryptedRefreshToken = credentials.refresh_token
      ? encryptString(credentials.refresh_token)
      : null;

    if (encryptedRefreshToken)
      console.log(
        "New refresh token was returned from youtube api, storing it in db.",
      );

    // Make sure we can decrypt the credentials
    decryptYoutubeCredentials(encryptedCredentials);

    // Insert the encrypted credentials into the database
    const { data, error } = await supabaseAdmin.from("oauth_creds").upsert(
      {
        user_id: userId,
        service_name: "YouTube",
        token: encryptedCredentials,
        service_account_id: youtubeChannelId,
        // Only update the service account data if it is provided
        ...(youtubeChannelImageUrl != null
          ? { service_account_image_url: youtubeChannelImageUrl }
          : {}),
        ...(youtubeChannelTitle != null
          ? { service_account_name: youtubeChannelTitle }
          : {}),
        // Only update the refresh token if it is provided
        ...(encryptedRefreshToken != null
          ? { refresh_token: encryptedRefreshToken }
          : {}),
      },
      { onConflict: "service_account_id", ignoreDuplicates: false },
    );

    if (error) {
      console.error("Error while trying to persist credentials: ", error);
      throw new Error("Error occurred while trying to persist credentials");
    }

    return data;
  } catch (error) {
    // User will need to re-authenticate
    console.error("Error while trying to persist credentials: ", error);
    throw new Error("Error occurred while trying to persist credentials");
  }
}

// TODO: This might not be a good practice, i dont know if the youtube api will always return the channel id ? read the docs

export type YoutubeChannelSummary = {
  channelId: string;
  channelTitle: string;
  channelAvatar: string | null;
};

// TODO: Review this, probably want to periodically refresh the channel summary
// Returns summary of youtube channel associated with the provided credentials
// We might also want to cache this with redis to prevent unnecessary requests and api quota usage
// Pass in the channel ID if you already have it, otherwise it will be retrieved from the youtube API
// Make sure the channel ID corresponds to the correct user before returning the summary
export async function getYoutubeChannelSummary(
  credentials: Credentials,
  channelID?: string,
): Promise<YoutubeChannelSummary> {
  try {
    if (!credentials.access_token) {
      throw new Error("No credentials provided");
    }

    // Try to read the summary from the database first if the channel ID is provided
    if (channelID) {
      console.log(
        "Trying to get channel summary from database",
        "received channel ID: ",
        channelID,
      );

      const {
        data: channelData,
      }: {
        data: {
          service_account_id: string;
          service_account_name: string;
          service_account_image_url: string | null;
        } | null;
      } = await supabaseAdmin
        .from("oauth_creds")
        .select(
          "service_account_id, service_account_name, service_account_image_url",
        )
        .eq("service_account_id", channelID)
        .single();

      if (channelData?.service_account_name) {
        return {
          channelTitle: channelData.service_account_name,
          channelAvatar: channelData.service_account_image_url,
          channelId: channelData.service_account_id,
        };
      }
    }

    console.log("Trying to get channel ID from YouTube API");

    // Use the credentials to make a request to the YouTube API to get the user's channel ID
    const { data: channelData } = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
      access_token: credentials.access_token,
    });

    if (
      !channelData ??
      !channelData.items ??
      !channelData.items[0] ??
      !channelData.items[0].id
    ) {
      throw new Error("Could not get channel ID from YouTube API response");
    }

    // TODO: Get channel title, and avatar, these are not required but provide better UX

    return {
      channelId: channelData.items[0].id,
      channelTitle: channelData.items[0]?.snippet?.title ?? "Unknown Channel",
      channelAvatar:
        channelData.items[0]?.snippet?.thumbnails?.default?.url ?? null,
    };
  } catch (err) {
    console.error("Error while trying to get channel ID: ", err);
    throw new Error("Error occurred while trying to get channel ID");
  }
}
