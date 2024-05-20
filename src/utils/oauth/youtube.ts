import { GoogleAuth, OAuth2Client } from "google-auth-library";
import { env } from "~/env";

export const oAuth2Client = new OAuth2Client({
  clientId: env.YOUTUBE_OAUTH_CLIENT_ID,
  clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET,
});
