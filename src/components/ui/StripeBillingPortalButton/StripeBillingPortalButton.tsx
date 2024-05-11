"use client";
import { useState } from "react";
import { Button } from "../Button";
import { usePathname, useRouter } from "next/navigation";
import { createStripePortal } from "~/utils/stripe/server";

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
    <Button disabled={isSubmitting} onClick={handleStripePortalRequest}>
      {labelText ?? "Manage your Subscription"}
    </Button>
  );
}
