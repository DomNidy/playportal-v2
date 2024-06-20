import { redirect } from "next/navigation";
import ManageAccount from "~/components/ui/ManageAccount/ManageAccount";
import { createClient } from "~/utils/supabase/server";
import { getErrorRedirect } from "~/utils/utils";

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

  const { data: uploadYoutubeVideoDailyQuotaUsage } = await supabase.rpc(
    "get_user_quota_usage_daily_upload_youtube_video",
    {
      user_id: user?.id ?? "",
    },
  );

  const { data: userWithProduct } = await supabase
    .from("user_products")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .limit(1)
    .maybeSingle();

  if (!user) {
    return redirect(
      getErrorRedirect(
        "/sign-in",
        "Error",
        "You must be logged in to access this page.",
      ),
    );
  }

  return (
    <div className="flex w-full max-w-[500px]">
      <ManageAccount
        user={user}
        userWithProduct={userWithProduct ?? undefined}
        quotas={{
          createVideo: {
            dailyQuotaLimit: quotaLimits?.create_video_daily_quota ?? 0,
            dailyQuotaUsage: createVideoDailyQuotaUsage ?? 0,
          },
          uploadYoutubeVideo: {
            dailyQuotaLimit: quotaLimits?.upload_youtube_daily_quota ?? 0,
            dailyQuotaUsage: uploadYoutubeVideoDailyQuotaUsage ?? 0,
          },
        }}
        featureFlags={{
          linkYoutubeAccounts: true,
        }}
      />
    </div>
  );
}
