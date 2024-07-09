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
    <div className="flex w-full flex-col  items-center rounded-xl border-2 border-white/10">
      {/** Plan intro section */}
      <div
        style={{
          backgroundColor: "rgba(20, 20, 20, 1)",
        }}
        className="flex h-[300px] w-full flex-col gap-2 rounded-t-xl px-4 py-8"
      >
        {/** Plan title */}
        <h3 className="text-center text-2xl font-semibold">{planName}</h3>
        {/** Plan description */}
        <>{planDescription}</>

        {/** Plan price */}
        <h2 className="mt-4 text-center text-3xl font-medium">
          ${planPrice} <span className="text-lg">/mo</span>
        </h2>

        {/** Plan CTA */}
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
      </div>
      {/** Plan features section */}
      <div
        style={{
          backgroundColor: "rgba(22, 22, 22, 1)",
        }}
        className=" flex w-full flex-col gap-4 rounded-b-xl px-4 py-4"
      >
        <p className="my-2 font-semibold tracking-tight ">
          {planName} tier includes:
        </p>
        {planFeatures.map((feature, index) => (
          <p className="flex tracking-tight text-muted-foreground" key={index}>
            <CheckCircle2 className="mr-2 inline" color="green" /> {feature}
          </p>
        ))}
      </div>
    </div>
  );
}
