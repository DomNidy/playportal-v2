import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "~/utils/supabase/server";
import { getErrorRedirect, getURL } from "~/utils/utils";

// This route is redirected after user is sent a confirmation email to confirm signup or whenever they are sent an OTP
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  console.log(searchParams, request);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    console.log(
      "Trying to verify OTP for user with token_hash:",
      token_hash,
      "and type:",
      type,
    );
    const supabase = createClient();

    const { error, data } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log("Successfully verified OTP for user with id:", data.user?.id);
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    }

    console.error("Error verifying OTP:", error);
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(
    getErrorRedirect(
      getURL("/sign-up"),
      "Error occured during sign-up",
      "Please try again, or contact support.",
    ),
  );
}
