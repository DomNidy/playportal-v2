"use client";
import { Check } from "lucide-react";
import React from "react";
import { Button } from "../Button";
import { type Tables } from "types_db";
import { type User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { checkoutWithStripe } from "~/utils/stripe/server";
import { getErrorRedirect } from "~/utils/utils";
import { getStripe } from "~/utils/stripe/client";
import { toast } from "../Toasts/use-toast";

export default function PricingProduct({
  product,
  user,
}: {
  product: Tables<"products_prices">;
  user: User | null | undefined;
}) {
  const router = useRouter();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Tables<"prices">) => {
    if (!user) {
      return router.push("/sign-up");
    }

    // From out ProductWithPriceAndParsedMetadata, extract the relevant props

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath,
    );

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

    const stripe = await getStripe();
    void stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <div className=" flex h-[300px] w-full flex-col items-start rounded-xl border-[1px] border-colors-accent-300 bg-black px-4 py-2 text-left">
      <p className="font- mb-1 mt-0 text-sm font-bold uppercase text-colors-primary-500">
        {product.name}
      </p>
      <p className="my-0 mb-6 text-sm text-colors-text-50">
        {product.description}
      </p>

      <div className="mb-3 flex flex-col items-start gap-2">
        <div className="flex flex-row gap-2">
          <Check className="text-violet-500" size={18} />
          <span className="text-sm text-colors-text-50">
            Create {product.create_video_daily_quota} Videos per day.
          </span>
        </div>

        {product.file_size_limit_mb && (
          <div className="flex flex-row gap-2">
            <Check className="text-violet-500" size={18} />
            <span className="text-sm text-colors-text-50">
              {product.file_size_limit_mb} MB File upload limit.
            </span>
          </div>
        )}
      </div>

      <Button
        className="mt-auto w-full self-center bg-white"
        onClick={() => {
          if (product.price_id) {
            void handleStripeCheckout({
              active: product.price_active,
              currency: product.currency,
              id: product.price_id,
              interval: product.interval,
              interval_count: product.interval_count,
              metadata: product.price_metadata,
              product_id: product.product_id,
              trial_period_days: product.trial_period_days,
              type: product.price_type,
              unit_amount: product.unit_amount,
              description: null,
            });
          } else {
            // We should have a price_id here, but incase we don't show an error toast and dont try to checkout
            toast({
              title: "Something went wrong",
              description: "Please try again later or contact support",
              variant: "destructive",
            });
          }
        }}
      >
        Subscribe
      </Button>
    </div>
  );
}
