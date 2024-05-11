import StripeBillingPortalButton from "~/components/ui/StripeBillingPortalButton/StripeBillingPortalButton";
import { createClient } from "~/utils/supabase/server";

// TODO: Implement error handling here
export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user);

  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);
  const endToday = new Date();
  endToday.setUTCHours(23, 59, 59, 999);

  const { data: quotaLimits } = await supabase
    .rpc("get_user_quota_limits", {
      user_id: user?.id ?? "",
    })
    .maybeSingle();

  const { data: quotaUsage } = await supabase.rpc(
    "get_user_quota_usage_daily_create_video",
    {
      user_id: user?.id ?? "",
    },
  );

  const { data: userWithProduct } = await supabase
    .from("user_products")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .eq("sub_status", "active")
    .maybeSingle();

  console.log(quotaUsage, "usage");

  // TODO: Rewrite this code to be more clear, it is unintuitive that `quotaLimits` and or `userWithProduct` being null means that the user has no sub
  if (!userWithProduct) {
    return (
      <div className="flex flex-col">
        <p>You have no active subscription.</p>
        <StripeBillingPortalButton labelText="View your Billing Info" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <StripeBillingPortalButton />
        <ul>
          <li>
            <label>Subscription Plan: </label>
            {userWithProduct.product_name}
          </li>
          <li>
            <label>Video(s) created Today: </label>
            {quotaUsage} / {quotaLimits?.create_video_daily_quota ?? 0}
          </li>
        </ul>
      </div>

      <div>Quota resets at {endToday.toString()}</div>
    </div>
  );
}
