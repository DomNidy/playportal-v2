"use client";
import { useState } from "react";
import { Button } from "../Button";
import { usePathname, useRouter } from "next/navigation";
import { createStripePortal } from "~/server/helpers/stripe";

// Button that opens up the stripe billing portal for the user
export default function StripeBillingPortalButton({
  labelText,
}: {
  labelText?: string;
}) {
  const currentPath = usePathname();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  console.log(currentPath);

  const handleStripePortalRequest = async () => {
    setIsSubmitting(true);
    console.log(currentPath);
    const redirectUrl = await createStripePortal(currentPath);
    setIsSubmitting(false);
    return router.push(redirectUrl);
  };

  return (
    <Button
      disabled={isSubmitting}
      onClick={handleStripePortalRequest}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      {labelText ?? "Manage your Subscription"}
    </Button>
  );
}
