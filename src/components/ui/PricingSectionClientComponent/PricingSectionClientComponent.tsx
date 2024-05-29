import React from "react";
import { type Tables } from "types_db";
import { PricingCard } from "../LandingPage";
import { useUserSubscription } from "~/hooks/use-user-subscription";

export default function PricingSectionClientComponent({
  basicPlan,
  standardPlan,
  proPlan,
}: {
  basicPlan?: Tables<"products_prices">;
  standardPlan?: Tables<"products_prices">;
  proPlan?: Tables<"products_prices">;
}) {
  const userSub = useUserSubscription();

  console.log(proPlan?.product_id);
  return (
    <>
      {basicPlan && (
        <PricingCard
          planData={basicPlan}
          planDescription={
            <p className="text-white text-opacity-[0.83]">
              Create <strong>5 Videos</strong> per day.
            </p>
          }
          planFeatures={[
            <p key={"1"} className="text-white">
              Create <strong>5 Videos</strong> per day.
            </p>,
            <p key={"2"} className="text-white">
              <strong>100 MB</strong> File upload limit.
            </p>,
          ]}
          planName="BASIC"
          planPrice={(basicPlan.unit_amount ?? 495) / 100}
          userOwnsPlan={userSub.data?.product_id == basicPlan.product_id}
        />
      )}
      {standardPlan && (
        <PricingCard
          planData={standardPlan}
          planDescription={
            <p className="text-white text-opacity-[0.83]">
              Create <strong>10 Videos</strong> per day.
            </p>
          }
          planFeatures={[
            <p key={"1"} className="text-white">
              Create <strong>10 Videos</strong> per day.
            </p>,
            <p key={"2"} className="text-white">
              <strong>150 MB</strong> File upload limit.
            </p>,
          ]}
          planName="STANDARD"
          planPrice={(standardPlan.unit_amount ?? 995) / 100}
          userOwnsPlan={userSub.data?.product_id == standardPlan.product_id}
        />
      )}
      {proPlan && (
        <PricingCard
          planData={proPlan}
          planDescription={
            <p className="text-white text-opacity-[0.83]">
              Create <strong>30 Videos</strong> per day.
            </p>
          }
          planFeatures={[
            <p key={"1"} className="text-white">
              Create <strong>30 Videos</strong> per day.
            </p>,
            <p key={"2"} className="text-white">
              <strong>200 MB</strong> File upload limit.
            </p>,
          ]}
          planName="PRO"
          planPrice={(proPlan.unit_amount ?? 1495) / 100}
          userOwnsPlan={userSub.data?.product_id == proPlan.product_id}
        />
      )}
    </>
  );
}
