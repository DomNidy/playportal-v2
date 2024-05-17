import Image from "next/image";
import Link from "next/link";
import Product from "~/components/ui/Product/Product";
import { createClient } from "~/utils/supabase/server";
import { getURL } from "~/utils/utils";

export default async function KitPage({
  params,
}: {
  params: { kitName: string };
}) {
  const { kitName } = params;
  const supabase = createClient();

  const { data: kitData, error } = await supabase
    .from("kits")
    .select()
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
      <Product
        product={{
          title: kitData.name,
          description: kitData.description ?? "",
          downloadLink: kitData.download_url,
          imageSrc: kitData.image_url ?? "",
          variant: "large"
        }}
      />
    </div>
  );
}
