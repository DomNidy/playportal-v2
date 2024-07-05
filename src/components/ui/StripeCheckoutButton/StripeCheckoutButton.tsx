"use client";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "~/utils/supabase/client";
import { type Tables } from "types_db";
import { checkoutWithStripe } from "~/server/helpers/stripe";
import { getErrorRedirect, getStatusRedirect } from "~/utils/utils";
import { getStripe } from "~/utils/stripe/client";
import { toast } from "../Toasts/use-toast";
import { Button } from "../Button";
import { useState } from "react";
import LoaderStatus from "../LoaderStatus";

export default function StripeCheckoutButton({
  ...productData
}: Tables<"products_prices">) {
  const supabase = createClient();
  const router = useRouter();
  const currentPath = usePathname();

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleStripeCheckout = async (
    productData: Tables<"products_prices">,
  ) => {
    try {
      // Need a session
      const { data: userData, error } = await supabase.auth.getUser();
      const { user } = userData;

      // TODO: Redirect to sign up flow
      if (!user ?? error) {
        return router.push(
          getStatusRedirect(
            "/sign-up",
            "Please sign up ",
            "You must be signed in to purchase a plan. Redirecting to sign up page.",
          ),
        );
      }

      const { errorRedirect, sessionId } = await checkoutWithStripe({
        active: productData.price_active,
        id: productData.price_id ?? "",
        currency: productData.currency,
        unit_amount: productData.unit_amount,
        interval: productData.interval,
        interval_count: productData.interval_count,
        metadata: productData.price_metadata,
        product_id: productData.product_id,
        trial_period_days: productData.trial_period_days,
        type: productData.price_type,
        description: productData.description,
      });

      if (errorRedirect) {
        return router.push(errorRedirect);
      }

      if (!sessionId) {
        return router.push(
          getErrorRedirect(
            currentPath,
            "An unknown error occured.",
            "Please try again later or contact support.",
          ),
        );
      }

      // Redirect to checkout flow with stripe if everything is successful
      const stripe = await getStripe();
      void stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({
        title: "An error occured",
        variant: "destructive",
        description:
          "An error occured while trying to check out, please try again later or contact support.",
      });
    }
  };

  return (
    <Button
      onClick={() => {
        setIsCheckoutLoading(true);
        void handleStripeCheckout(productData).then(() => {
          setIsCheckoutLoading(false);
        });
      }}
      disabled={isCheckoutLoading}
    >
      <LoaderStatus isLoading={isCheckoutLoading} text="Upgrade Now" />
    </Button>
  );
}
