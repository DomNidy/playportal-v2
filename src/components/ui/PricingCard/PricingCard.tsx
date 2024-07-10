import { CheckCircle2 } from "lucide-react";
import React from "react";
import { type PricingCardProps } from "./definitions";

export default function PricingCard({
  planName,
  planDescription,
  planFeatures,
  planPrice,
  planCTAButton,
}: PricingCardProps) {
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
        {planDescription}

        {/** Plan price */}
        <h2 className="mt-4 text-center text-3xl font-medium">
          ${planPrice} <span className="text-lg">/mo</span>
        </h2>

        {/** Plan CTA */}
        {planCTAButton}
      </div>
      {/** Plan features section */}
      <div
        style={{
          backgroundColor: "rgba(22, 22, 22, 1)",
        }}
        className=" flex w-full flex-col gap-4 rounded-b-xl px-4 py-4 h-full"
      >
        <p className="my-2 font-semibold tracking-tight ">
          {planName} Tier includes:
        </p>
        {planFeatures.map((feature, index) => (
          <div key={index} className="flex">
            <CheckCircle2 className="mr-2 inline" color="green" /> {feature}
          </div>
        ))}
      </div>
    </div>
  );
}
