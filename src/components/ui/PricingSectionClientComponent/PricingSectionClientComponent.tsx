import React from "react";
import { type Tables } from "types_db";
import { PricingCard, PricingCardCheckoutButton } from "../PricingCard";
import { useUserSubscription } from "~/hooks/use-user-subscription";
import { Button } from "../Button";
import { CheckCircle2 } from "lucide-react";

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

  return (
    <>
      <PricingCard
        planName="FREE"
        planCTAButton={
          <Button disabled className="gap-2">
            You own this! <CheckCircle2 className="inline h-4 w-4" />
          </Button>
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
                userSub.data?.product_id === basicPlan.product_id
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
                userSub.data?.product_id === standardPlan.product_id
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
                userSub.data?.product_id === proPlan.product_id
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
