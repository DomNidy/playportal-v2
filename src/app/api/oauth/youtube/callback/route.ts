// TODO:
// Parse code from params, use it to exchange for access token and refresh token, persist that to DB and associate with user
// We will probably need to use cookies to check which user is currently logged in via the supabase session

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import { getErrorRedirect, getURL } from "~/utils/utils";

export async function GET(req: NextRequest, res: NextResponse) {
  // Code param is the authorization code we need to exchange for an access token
  const code = req.nextUrl.searchParams.get("code");
  // State param should correspond to a user id
  const state = req.nextUrl.searchParams.get("state");

  // Create supabase server client to get the user from the cookie
  const supabaseClient = createClient();
  const {
    data: { user: user },
  } = await supabaseClient.auth.getUser();

  // A generic redirect url that we'll use if something goes wrong
  const redirectErrorURL = getErrorRedirect(
    `${getURL()}/dashboard/account`,
    "Error",
    "Something went wrong while trying to connect your YouTube account. Please try again later or contact support.",
  );

  if (!code) {
    console.error("No code provided in query params");
    return NextResponse.redirect(redirectErrorURL);
  }

  if (state !== user?.id) {
    console.error("State param does not match user id");
    return NextResponse.redirect(redirectErrorURL);
  }

  // Get the code verifier from the cookie
  const codeVerifier = req.cookies.get("code_verifier");
  console.log(codeVerifier);

  if (!codeVerifier) {
    console.error("No code verifier found in cookies");
    return NextResponse.redirect(redirectErrorURL);
  }

  // Exchange the code for an access token and refresh token
  // We need to use the code verifier that we stored in a cookie
}
