import { redirect } from "next/navigation";
import React from "react";
import ConfirmSignupScreen from "~/components/ui/AuthForms/ConfirmSignup";
import { getErrorRedirect } from "~/utils/utils";

export default function ConfirmSignupPage({
  searchParams,
}: {
  searchParams: {
    confirmation_url: string; // Supabase url param that contains the confirmation url (our endpoint to verify the confirmation token)
    type: string; // Supabase url param that indicates the type of confirmation (e.g. signup)
  };
}) {
  console.log(searchParams);

  if (!searchParams.confirmation_url ?? !searchParams.type)
    redirect(
      getErrorRedirect(
        "/sign-up",
        "Error occured during sign-up",
        "Please try again, or contact support.",
      ),
    );

  // Parse out the confirmation url & type params from the url
  const confirmationURL = new URL(
    searchParams.confirmation_url.concat(`&type=${searchParams.type}`),
  ).toString();

  console.log(confirmationURL);

  return (
    <div
      className="dark flex items-center "
      style={{
        height: "calc(100vh - 186px)",
      }}
    >
      <ConfirmSignupScreen confirmationUrl={confirmationURL} />
    </div>
  );
}
