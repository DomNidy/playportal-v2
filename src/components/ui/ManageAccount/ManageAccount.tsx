import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs/Tabs";
import { Label } from "../Label";
import Link from "next/link";
import StripeBillingPortalButton from "../StripeBillingPortalButton/StripeBillingPortalButton";
import { type Tables } from "types_db";
import ManageYoutubeConnections from "../ManageYoutubeConnections/ManageYoutubeConnections";

export default function ManageAccount({
  userWithProduct,
  quotas,
  featureFlags,
}: {
  userWithProduct?: Tables<"user_products">;
  quotas?: {
    createVideo: {
      dailyQuotaLimit: number;
      dailyQuotaUsage: number;
    };
    uploadYoutubeVideo: {
      dailyQuotaLimit: number;
      dailyQuotaUsage: number;
    };
  };
  featureFlags?: {
    linkYoutubeAccounts: boolean;
  };
}) {
  return (
    <Tabs
      defaultValue="account"
      className="dark mx-auto
    mt-8 w-fit min-w-[400px]
    "
    >
      {/* Change grid-cols to grid-cols-2 if we want another tab */}
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-1">
              <Label>Subscription Plan</Label>
              {userWithProduct ? (
                <p>{userWithProduct.product_name}</p>
              ) : (
                <p>
                  No active subscription,{" "}
                  <span>
                    <Link href={"/#pricing"} className="text-blue-400">
                      click here to upgrade.
                    </Link>
                  </span>
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <Label>Videos created Today</Label>
              <p>
                {userWithProduct && quotas
                  ? `${quotas.createVideo.dailyQuotaUsage} / ${quotas.createVideo.dailyQuotaLimit}`
                  : "You are not subscribed to any plan."}
              </p>
            </div>

            {featureFlags?.linkYoutubeAccounts && (
              <div className="flex flex-col space-y-1">
                <Label>YouTube videos uploaded Today</Label>
                <p>
                  {userWithProduct && quotas
                    ? `${quotas.uploadYoutubeVideo.dailyQuotaUsage} / ${quotas.uploadYoutubeVideo.dailyQuotaLimit}`
                    : "You are not subscribed to any plan."}
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <Label>Reset password</Label>
              <Link
                id="update-password"
                href={"/dashboard/account/update-password"}
                className="inline-flex h-fit items-center justify-center  whitespace-nowrap rounded-md bg-primary-foreground  bg-white px-3 py-[0.53rem] text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Reset Password
              </Link>
            </div>

            <div className="flex flex-col space-y-1">
              <Label>Manage Billing/Subscription</Label>
              <StripeBillingPortalButton />
            </div>

            {featureFlags?.linkYoutubeAccounts && (
              <div className="flex flex-col space-y-1">
                <Label>Connected YouTube Account(s)</Label>
                <ManageYoutubeConnections />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
