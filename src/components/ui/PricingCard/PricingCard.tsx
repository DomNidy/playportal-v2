import { CheckCircle2 } from "lucide-react";
import React from "react";
import { type PricingPlan } from "./definitions";
import StripeCheckoutButton from "../StripeCheckoutButton/StripeCheckoutButton";
import { Button } from "../Button";

export default function PricingCard({
  planData,
  planName,
  planDescription,
  planFeatures,
  planPrice,
  currentUserOwnsPlan,
}: PricingPlan) {
  return (
    <div className="flex h-[330px] max-w-[330px] flex-col rounded-lg bg-[#0F0F0F] p-4">
      <h2 className="text-xl font-bold tracking-tight text-white">
        {planName}
      </h2>

      <h1 className="mb-2 text-[32px] font-bold tracking-tighter text-white">
        ${planPrice}
      </h1>

      <>{planDescription}</>

      <div className="mt-6 flex flex-col gap-4 grow">
        {planFeatures.map((feature, index) => (
          <div className="flex gap-2" key={index}>
            <CheckCircle2 className="text-white" /> {feature}
          </div>
        ))}
      </div>

      {!currentUserOwnsPlan ? (
        <StripeCheckoutButton {...planData} />
      ) : (
        <Button disabled className="gap-2">
          You own this! <CheckCircle2 className="inline h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
