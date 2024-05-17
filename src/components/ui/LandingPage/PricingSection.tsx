import React from "react";
import { type Tables } from "types_db";
import { env } from "~/env";
import { createClient } from "~/utils/supabase/server";
import { PricingCard } from "./PricingCard";

export type PricingPlan = {
  planName: string;
  planPrice: number;
  // A <p> element, we pass it this way because we want to apply custom styling to it
  planDescription: React.ReactNode;
  // An array of <p> elements, we pass them this way because we want to apply custom styling to certain parts of each element
  planFeatures: React.ReactNode[];
  planData: Tables<"products_prices">;
};

export default async function PricingSection({
  displayMode,
}: {
  displayMode: "landing" | "account";
}) {
  // Fetch the data for each pricing option here

  const supabase = createClient();
  const { data: products } = await supabase
    .from("products_prices")
    .select("*")
    .eq("product_active", true);

  // Find each plan by its product id
  const basicPlan = products?.find(
    (product) =>
      product.product_id == env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_BASIC_PLAN,
  );

  const standardPlan = products?.find(
    (product) =>
      product.product_id == env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_STANDARD_PLAN,
  );

  const proPlan = products?.find(
    (product) =>
      product.product_id == env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PRO_PLAN,
  );

  return (
    <div
      className={`${displayMode === "landing" ? "mt-[400px] md:mt-[440px] lg:mt-[600px]" : ""} flex max-w-[800px] flex-col items-center`}
    >
      <h2 className="text-center text-3xl font-semibold tracking-tighter text-white md:text-4xl">
        Our Plans
      </h2>

      <div className="mt-8 flex w-full flex-col items-center justify-evenly gap-4 sm:flex-row ">
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
          />
        )}
      </div>
    </div>
  );
}
