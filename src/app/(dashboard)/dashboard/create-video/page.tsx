import CreateVideoForm from "~/components/ui/CreateVideoForm/CreateVideoForm";
import PricingSection from "~/components/ui/LandingPage/PricingSection";
import { createClient } from "~/utils/supabase/server";
import { getFeatureFlag } from "~/utils/utils";

export default async function CreateVideoPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quotaLimits } = await supabase
    .rpc("get_user_quota_limits", {
      user_id: user?.id ?? "",
    })
    .maybeSingle();

  const uploadVideoFeature = await getFeatureFlag(
    supabase,
    "upload_videos",
    user?.id ?? "",
  );

  if (!quotaLimits) {
    return (
      <div className="flex justify-center flex-col items-center max-w-[800px]">
        <h2 className="text-3xl font-semibold">You don{"'t"} have access to this</h2>
        <p className="mb-12">
          In order to provide the best service possible, we are currently
          restricting video creations to paid subscribers only. If you are
          interested in subscribing, please check out our pricing below.
        </p>
        <PricingSection displayMode="account" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1050px]">
      <CreateVideoForm
        fileSizeQuotaLimitBytes={
          quotaLimits?.file_size_limit_mb
            ? quotaLimits?.file_size_limit_mb * 1024 * 1024
            : 0
        }
        uploadVideoFeature={uploadVideoFeature}
      />
    </div>
  );
}
