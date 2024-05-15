import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import { createClient } from "~/utils/supabase/server";

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

  return (
    <div className="w-full max-w-[1050px]">
      <CreateVideoForm
        fileSizeQuotaLimitBytes={
          quotaLimits?.file_size_limit_mb
            ? quotaLimits?.file_size_limit_mb * 1024 * 1024
            : 0
        }
      />
    </div>
  );
}
