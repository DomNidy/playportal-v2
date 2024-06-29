"server only";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { env } from "~/env";
import { getURL } from "~/utils/utils";

export const youtubeOAuthClient = new OAuth2Client({
  clientId: env.YOUTUBE_OAUTH_CLIENT_ID,
  clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET,
  redirectUri: `${getURL()}/api/oauth/youtube/callback`,
});

export const youtubeApiClient = google.youtube({
  auth: env.YOUTUBE_API_KEY,
  version: "v3",
});
