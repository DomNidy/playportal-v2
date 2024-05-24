import { type Metadata } from "next";
import Product from "~/components/ui/Product/Product";
import { createClient } from "~/utils/supabase/server";
import { getURL } from "~/utils/utils";

const meta = {
  title: "Playportal | Downloads",
  description: "Free drum kits, midi kits, loop kits for music producers.",
  icons: [{ rel: "icon", url: "/playportal.svg" }],
  favicon: "/playportal.svg",
  robots: "follow, index",
  url: getURL(),
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: "origin-when-cross-origin",
    keywords: [
      "playportal",
      "type beat",
      "beat stars",
      "drum kits",
      "midi kits",
      "free drum kits",
      "free vsts",
      "loop kits",
      "tunestotube",
      "producer tools",
      "tunestotube alternative",
    ],
    authors: [{ name: "Playportal", url: "https://playportal.app" }],
    creator: "Playportal",
    publisher: "Playportal",
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      siteName: meta.title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@playportal",
      creator: "@playportal",
      title: meta.title,
      description: meta.description,
      images: [meta.favicon],
    },
  };
}

export default async function DownloadsPage() {
  const supabase = createClient();

  // TODO: Implement pagination eventually
  const { data: kits } = await supabase.from("kits").select("*");

  return (
    <div className="flex flex-col items-center px-24">
      <div className="landing-bg-gradient pointer-events-none absolute top-0 h-[1450px] max-h-screen w-full " />

      <div className="mt-24 grid justify-items-center gap-10 lg:grid-cols-2 xl:grid-cols-3">
        {kits?.map((kit) => (
          <Product
            key={kit.name}
            product={{
              description: kit.description ?? "",
              downloadLink: kit.download_url,
              imageSrc: kit.image_url ?? "",
              title: kit.name,
              variant: "default",
            }}
          />
        ))}
      </div>
    </div>
  );
}
