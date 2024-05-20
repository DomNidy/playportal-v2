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
