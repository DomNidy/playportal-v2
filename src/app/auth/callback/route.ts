import { createClient } from "~/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getErrorRedirect, getStatusRedirect, getURL } from "~/utils/utils";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Putting this here to force dynamic nextjs endpoint
  cookies();
  console.log("auth/callback request", request.url);

  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log(requestUrl);

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          getURL("/sign-in"),
          error.name,
          "Sorry, we weren't able to log you in. Please try again.",
        ),
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    getStatusRedirect(
      getURL("/dashboard"),
      "Success!",
      "You are now signed in.",
    ),
  );
}
