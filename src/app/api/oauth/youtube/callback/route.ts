// TODO:
// Parse code from params, use it to exchange for access token and refresh token, persist that to DB and associate with user
// We will probably need to use cookies to check which user is currently logged in via the supabase session

import { type NextRequest, NextResponse } from "next/server";
import {
  decryptYoutubeCredentials,
  encryptYoutubeCredentials,
  oAuth2Client,
  youtube,
} from "~/utils/oauth/youtube";
import { supabaseAdmin } from "~/utils/supabase/admin";
import { createClient } from "~/utils/supabase/server";
import { getErrorRedirect, getStatusRedirect, getURL } from "~/utils/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, res: NextResponse) {
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

    console.log(req);
    console.log(req.cookies);
    console.log(user);

    if (!code) {
      console.error("No code provided in query params");
      return NextResponse.redirect(redirectErrorURL);
    }

    if (state !== user?.id) {
      console.error("State param does not match user id");
      return NextResponse.redirect(redirectErrorURL);
    }

    // Get the code verifier from the cookie
    const codeVerifierCookie = req.cookies.get("code_verifier");

    if (!codeVerifierCookie) {
      console.error("No code verifier found in cookies");
      return NextResponse.redirect(redirectErrorURL);
    }

    const { value: codeVerifier } = codeVerifierCookie;

    // Exchange the code for an access token and refresh token
    // We need to use the code verifier that we stored in a cookie
    const { res, tokens } = await oAuth2Client.getToken({
      code,
      codeVerifier,
    });

    const encryptedCredentials = encryptYoutubeCredentials(tokens);
    // Try to decrypt the credentials to make sure they were encrypted correctly (throws an error if not)
    const decryptedCredentials =
      decryptYoutubeCredentials(encryptedCredentials);

    // Use the credentials to make a test request to the YouTube API to get the user's channel ID
    const { data: channelData } = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
      access_token: decryptedCredentials.access_token!,
    });

    // Ensure that we received the channel data
    // We will use the channel id to differentiate between different accounts associated with the same service and user on playportal
    // Since one user can connect multiple accounts from the same service
    if (
      !channelData ??
      !channelData.items ??
      !channelData.items[0] ??
      !channelData.items[0].id
    ) {
      console.error("No channel data found");
      return NextResponse.redirect(redirectErrorURL);
    }

    const associatedYoutubeChannelData = channelData.items[0];

    if (!associatedYoutubeChannelData.id) {
      console.error("No channel data found");
      return NextResponse.redirect(redirectErrorURL);
    }

    // Write the encrypted credentials to the database (this table is only accessible by the admin client)
    try {
      const { data, error } = await supabaseAdmin.from("oauth_creds").upsert({
        user_id: user.id,
        service_name: "YouTube",
        token: encryptedCredentials,
        service_account_id: associatedYoutubeChannelData.id,
      });
    } catch (error) {
      console.error(
        "Error while trying to connect write credentials to db: ",
        error,
      );
      return NextResponse.redirect(redirectErrorURL);
    }

    // Include the channel title in the success message if it exists
    const successRedirectMessage = associatedYoutubeChannelData.brandingSettings
      ?.channel?.title
      ? `Your YouTube channel ${associatedYoutubeChannelData.brandingSettings?.channel?.title} has been successfully connected.`
      : "Your YouTube channel has been successfully connected.";

    return NextResponse.redirect(
      getStatusRedirect(
        `${getURL()}/dashboard/account`,
        "Success",
        successRedirectMessage,
      ),
    );
  } catch (error) {
    console.error("Error while trying to connect YouTube account", error);
    return NextResponse.redirect(redirectErrorURL);
  }
}
