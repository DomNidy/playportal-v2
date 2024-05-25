import { redirect } from "next/navigation";
import React from "react";
import ConfirmSignupScreen from "~/components/ui/AuthForms/ConfirmSignup";
import { getErrorRedirect } from "~/utils/utils";

export default function ConfirmSignupPage({
  searchParams,
}: {
  searchParams: {
    confirmation_url: string;
  };
}) {
  if (!searchParams.confirmation_url)
    redirect(
      getErrorRedirect(
        "/sign-up",
        "Error occured during sign-up",
        "Please try again, or contact support.",
      ),
    );

  return (
    <div
      className="dark flex items-center "
      style={{
        height: "calc(100vh - 186px)",
      }}
    >
      <ConfirmSignupScreen confirmationUrl={searchParams.confirmation_url} />
    </div>
  );
}
