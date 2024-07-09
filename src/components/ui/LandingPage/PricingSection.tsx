import React from "react";
import { env } from "~/env";
import { createClient } from "~/utils/supabase/server";
import { PricingCard } from "../PricingCard";

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
    <div className=" my-24 flex w-full max-w-[1000px] flex-col bg-neutral-950">
      <h2 className="text-center text-4xl font-bold ">
        Grow your Channel Today
      </h2>
      <div className="mt-10 grid w-full  grid-cols-1 items-stretch gap-8 px-4 sm:grid-cols-2">
        {basicPlan && (
          <PricingCard
            planData={basicPlan}
            planDescription={
              <p className="text-center text-sm text-muted-foreground">
                See how much Playportal can streamline your workflow. Completely
                free.
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
              <p className="text-center text-sm text-muted-foreground">
                See how much Playportal can streamline your workflow. Completely
                free.
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

        {proPlan && (
          <PricingCard
            planData={proPlan}
            planDescription={
              <p className="text-center text-sm text-muted-foreground">
                See how much Playportal can streamline your workflow. Completely
                free.
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
