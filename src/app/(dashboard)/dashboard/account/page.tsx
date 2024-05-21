import { Database } from "types_db";
import ManageAccount from "~/components/ui/ManageAccount/ManageAccount";
import { createClient } from "~/utils/supabase/server";
import { getFeatureFlag } from "~/utils/utils";

// TODO: Implement error handling here
export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);
  const endToday = new Date();
  endToday.setUTCHours(23, 59, 59, 999);

  const { data: quotaLimits } = await supabase
    .rpc("get_user_quota_limits", {
      user_id: user?.id ?? "",
    })
    .maybeSingle();

  const { data: createVideoDailyQuotaUsage } = await supabase.rpc(
    "get_user_quota_usage_daily_create_video",
    {
      user_id: user?.id ?? "",
    },
  );

  const { data: userWithProduct } = await supabase
    .from("user_products")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .in("sub_status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();

  const linkYoutubeAccountFeature = await getFeatureFlag(
    supabase,
    "link_youtube_accounts",
    user?.id ?? "",
  );

  return (
    <div>
      <ManageAccount
        userWithProduct={userWithProduct ?? undefined}
        quotas={{
          createVideo: {
            dailyQuotaLimit: quotaLimits?.create_video_daily_quota ?? 0,
            dailyQuotaUsage: createVideoDailyQuotaUsage ?? 0,
          },
        }}
        featureFlags={{
          linkYoutubeAccounts: linkYoutubeAccountFeature ?? false,
        }}
      />
    </div>
  );
}
