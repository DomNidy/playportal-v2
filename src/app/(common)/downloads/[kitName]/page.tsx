import { Link } from "~/components/ui/Link";
import { MusicKit } from "~/components/ui/MusicKit";
import { createClient } from "~/utils/supabase/server";

export default async function KitPage({
  params,
}: {
  params: { kitName: string };
}) {
  const { kitName } = params;
  const supabase = createClient();

  const { data: kitData, error } = await supabase
    .from("kits")
    .select(
      "title:name, downloadURL:download_url, description, type, imageSrc:image_url",
    )
    .eq("name", kitName)
    .maybeSingle();

  if (error ?? !kitData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <div className="mb-44">
          <p>Kit not found.</p>
          <Link href="/downloads" className="text-muted-foreground underline">
            Back to downloads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-32 flex h-full flex-col items-center justify-center">
      <MusicKit {...kitData} />
    </div>
  );
}
