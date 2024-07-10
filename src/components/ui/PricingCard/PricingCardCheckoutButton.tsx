// This button is responsible for rendering the correct CTA button on a pricing card, depending on whether or not the user owns
// the product associated with the pricing card. This component needs the stripe product data to do this.

import { type Tables } from "types_db";
import StripeCheckoutButton from "../StripeCheckoutButton/StripeCheckoutButton";
import { Button } from "../Button";
import { CheckCircle2 } from "lucide-react";

export type PricingCardCheckoutButtonProps = {
  currentUserOwnsPlan?: boolean;
  planData: Tables<"products_prices">;
};

export default function PricingCardCheckoutButton({
  planData,
  currentUserOwnsPlan,
}: PricingCardCheckoutButtonProps) {
  return (
    <>
      {!currentUserOwnsPlan ? (
        <StripeCheckoutButton
          productData={planData}
          className="mt-auto rounded-md bg-[#0070f3] px-4 py-2 text-white hover:bg-[#0070f3]/90 active:bg-[#0070f3]/80"
        />
      ) : (
        <Button disabled className="gap-2">
          You own this! <CheckCircle2 className="inline h-4 w-4" />
        </Button>
      )}
    </>
  );
}
