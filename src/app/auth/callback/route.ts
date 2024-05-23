import { createClient } from "~/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getErrorRedirect, getStatusRedirect } from "~/utils/utils";

export async function GET(request: NextRequest) {
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
          `${requestUrl.origin}/sign-in`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again.",
        ),
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/dashboard`,
      "Success!",
      "You are now signed in.",
    ),
  );
}
