import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import { getErrorRedirect, getStatusRedirect } from "~/utils/utils";

// Because the /dashboard/account/update-password route is protected,
// We need to authenticate the user using the code from the query string, then redirect them to the update password page
export async function GET(request: NextRequest) {
  // Get the code from the query string
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient();

    // Authenticate the user using the code
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/reset-password`,
          error.name,
          "Sorry, we couldn't reset your password. Please try again.",
        ),
      );
    }

    return NextResponse.redirect(
      getStatusRedirect(
        `${requestUrl.origin}/dashboard/account/update-password`,
        "You are now signed in.",
        "Please enter a new password for your account.",
      ),
    );
  }

  return NextResponse.redirect(
    getErrorRedirect(
      `${requestUrl.origin}/reset-password`,
      "Failed to reset password",
      "Sorry, we coulnd't authenticate your, please try again or contact support.",
    ),
  );
}
