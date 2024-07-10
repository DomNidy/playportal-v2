import React from "react";
import { env } from "~/env";
import { createClient } from "~/utils/supabase/server";
import { PricingCard, PricingCardCheckoutButton } from "../PricingCard";
import { Link } from "../Link";

export default async function PricingSection() {
  // Fetch the data for each pricing option here

  const supabase = createClient();
  const { data: products } = await supabase
    .from("products_prices")
    .select("*")
    .eq("product_active", true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's subscription plan if they are authenticated
  let userSub = null;
  if (user) {
    const { data } = await supabase
      .from("user_products")
      .select("*")
      .in("sub_status", ["active", "trialing"])
      .eq("user_id", user.id)
      .order("sub_current_period_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    userSub = data;
  }

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
    <>
      <PricingCard
        planName="FREE"
        planCTAButton={
          <Link
            variant={"button"}
            href={"/sign-up"}
            className="mt-auto rounded-md bg-[#0070f3] px-4 py-2 text-white hover:bg-[#0070f3]/90 active:bg-[#0070f3]/80"
          >
            Try Now
          </Link>
        }
        planDescription={
          <p className="text-center text-sm text-muted-foreground">
            Test out Playportal completely free, see how much we can improve
            your workflow.
          </p>
        }
        planFeatures={[
          <p key={"1"} className="text-muted-foreground">
            Create <strong>1 Video</strong> per day.
          </p>,
          <p key={"2"} className="text-muted-foreground">
            Direct YouTube upload <strong>1 Video</strong> per day.
          </p>,
          <p key={"3"} className="text-muted-foreground">
            <strong>50 MB</strong> File upload limit.
          </p>,
        ]}
        planPrice={0}
      />

      {basicPlan && (
        <PricingCard
          planDescription={
            <p className="text-center text-sm text-muted-foreground">
              Increased quota limits for video creation and file uploads.
            </p>
          }
          planFeatures={[
            <p key={"1"} className="text-muted-foreground">
              Create <strong>5 Videos</strong> per day.
            </p>,
            <p key={"2"} className="text-muted-foreground">
              Direct YouTube upload <strong>5 Videos</strong> per day.
            </p>,
            <p key={"3"} className="text-muted-foreground">
              <strong>100 MB</strong> File upload limit.
            </p>,
          ]}
          planCTAButton={
            <PricingCardCheckoutButton
              planData={basicPlan}
              currentUserOwnsPlan={
                user ? userSub?.product_id == basicPlan.product_id : false
              }
            />
          }
          planName="BASIC"
          planPrice={(basicPlan.unit_amount ?? 495) / 100}
        />
      )}

      {standardPlan && (
        <PricingCard
          planDescription={
            <p className="text-center text-sm text-muted-foreground">
              Further increased quota limits for video creation and file
              uploads.
            </p>
          }
          planFeatures={[
            <p key={"1"} className="text-muted-foreground">
              Create <strong>10 Videos</strong> per day.
            </p>,
            <p key={"2"} className="text-muted-foreground">
              Direct YouTube upload <strong>10 Videos</strong> per day.
            </p>,
            <p key={"3"} className="text-muted-foreground">
              <strong>150 MB</strong> File upload limit.
            </p>,
          ]}
          planName="STANDARD"
          planPrice={(standardPlan.unit_amount ?? 995) / 100}
          planCTAButton={
            <PricingCardCheckoutButton
              planData={standardPlan}
              currentUserOwnsPlan={
                user ? userSub?.product_id === standardPlan.product_id : false
              }
            />
          }
        />
      )}

      {proPlan && (
        <PricingCard
          planDescription={
            <p className="text-center text-sm text-muted-foreground">
              Increased upload & video creation limits limits, access to new
              features first.
            </p>
          }
          planFeatures={[
            <p key={"1"} className="text-muted-foreground">
              Create <strong>30 Videos</strong> per day.
            </p>,
            <p key={"2"} className="text-muted-foreground">
              Direct YouTube upload <strong>30 Videos</strong> per day.
            </p>,
            <p key={"3"} className="text-muted-foreground">
              <strong>200 MB</strong> File upload limit.
            </p>,
          ]}
          planCTAButton={
            <PricingCardCheckoutButton
              planData={proPlan}
              currentUserOwnsPlan={
                user ? userSub?.product_id === proPlan.product_id : false
              }
            />
          }
          planName="PRO"
          planPrice={(proPlan.unit_amount ?? 1495) / 100}
        />
      )}
    </>
  );
}
