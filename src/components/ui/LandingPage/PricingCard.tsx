"use client";

import { CheckCircle2, CheckIcon } from "lucide-react";
import React from "react";
import { Button } from "../Button";
import { type PricingPlan } from "./PricingSection";
import { type Tables } from "types_db";
import { createClient } from "~/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { checkoutWithStripe } from "~/utils/stripe/server";
import { getErrorRedirect, getStatusRedirect } from "~/utils/utils";
import { getStripe } from "~/utils/stripe/client";

export default function PricingCard({
  planData,
  planName,
  planDescription,
  planFeatures,
  planPrice,
  userOwnsPlan,
}: PricingPlan) {
  const supabase = createClient();
  const router = useRouter();
  const currentPath = usePathname();

  const handleStripeCheckout = async (
    productData: Tables<"products_prices">,
  ) => {
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
  };

  return (
    <div className="flex h-[330px] max-w-[330px] flex-col rounded-lg bg-[#0F0F0F] p-4">
      <h2 className="text-xl font-bold tracking-tight text-white">
        {planName}
      </h2>

      <h1 className="mb-2 text-[32px] font-bold tracking-tighter text-white">
        ${planPrice}
      </h1>

      {planDescription}

      <div className="mt-6 flex flex-col gap-4">
        {planFeatures.map((feature, index) => (
          <div className="flex gap-2" key={index}>
            <CheckCircle2 className="text-white" /> {feature}
          </div>
        ))}
      </div>

      <Button
        className="mt-auto bg-white text-black hover:bg-white/85"
        disabled={userOwnsPlan}
        onClick={() => {
          if (!userOwnsPlan) {
            void handleStripeCheckout(planData);
          }
        }}
      >
        {!userOwnsPlan ? (
          "Get Started"
        ) : (
          <span>
            You own this! <CheckCircle2 className="inline h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
