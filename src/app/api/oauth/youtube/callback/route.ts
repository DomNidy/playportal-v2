import { type NextRequest, NextResponse } from "next/server";
import {
  decryptYoutubeCredentials,
  encryptYoutubeCredentials,
  getYoutubeChannelSummary,
  persistYoutubeCredentialsToDB,
} from "~/server/helpers/oauth/youtube";
import { youtubeOAuthClient } from "~/server/clients/oauth/youtube";
import { createClient } from "~/utils/supabase/server";
import {
  getErrorRedirect,
  getStatusRedirect,
  getURL,
  PlayportalClientError,
  PlayportalClientErrorCodes,
} from "~/utils/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // A generic redirect url that we'll use if something goes wrong
  const redirectErrorURL = getErrorRedirect(
    `${getURL()}/dashboard/account`,
    "Error",
    "Something went wrong while trying to connect your YouTube account. Please try again later or contact support.",
  );

  try {
    // Code param is the authorization code we need to exchange for an access token
    const code = req.nextUrl.searchParams.get("code");
    // State param should correspond to a user id
    const state = req.nextUrl.searchParams.get("state");

    // Create supabase server client to get the user from the cookie
    const supabaseClient = createClient();
    const {
      data: { user: user },
    } = await supabaseClient.auth.getUser();

    if (!code) {
      console.error("No code provided in query params");
      return NextResponse.redirect(redirectErrorURL);
    }

    if (state !== user?.id) {
      console.error("State param does not match user id");
      return NextResponse.redirect(redirectErrorURL);
    }

    // Get the code verifier from the cookie
    const codeVerifierCookie = req.cookies.get("codeVerifier");

    if (!codeVerifierCookie) {
      console.error("No code verifier found in cookies");
      return NextResponse.redirect(redirectErrorURL);
    }

    const { value: codeVerifier } = codeVerifierCookie;

    // Exchange the code for an access token and refresh token
    // We need to use the code verifier that we stored in a cookie
    const { tokens, res: getTokenResponse } = await youtubeOAuthClient.getToken(
      {
        code,
        codeVerifier,
      },
    );

    console.log("Get token response", JSON.stringify(getTokenResponse));

    // We will persist the credentials to the database
    const encryptedCredentials = encryptYoutubeCredentials(tokens);
    // Try to decrypt the credentials to make sure they were encrypted correctly (throws an error if not)
    const decryptedCredentials =
      decryptYoutubeCredentials(encryptedCredentials);

    // TODO: This might not be a good practice, i dont know if the youtube api will always return the channel id ? read the docs

    const { channelId, channelAvatar, channelTitle } =
      await getYoutubeChannelSummary(decryptedCredentials);

    if (!channelId) {
      console.error("No channel data found");
      return NextResponse.redirect(redirectErrorURL);
    }

    // Write the encrypted credentials to the database (this table is only accessible by the admin client)
    try {
      await persistYoutubeCredentialsToDB(
        decryptedCredentials,
        user?.id,
        channelId,
        channelAvatar ?? null,
        channelTitle,
      );
    } catch (error) {
      console.error(
        "Error while trying to connect write credentials to db: ",
        error,
      );
      return NextResponse.redirect(redirectErrorURL);
    }

    return NextResponse.redirect(
      getStatusRedirect(
        `${getURL()}/dashboard/account`,
        "Success",
        "Your YouTube channel has been successfully connected.",
      ),
    );
  } catch (error) {
    console.error("Error while trying to connect YouTube account", error);

    if (
      error instanceof PlayportalClientError &&
      error.code ===
        PlayportalClientErrorCodes.YOUTUBE_OAUTH_CHANNEL_ID_NOT_FOUND
    ) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${getURL()}/dashboard/account`,
          `Invalid YouTube Channel`,
          error.message,
        ),
      );
    }
    return NextResponse.redirect(redirectErrorURL);
  }
}
