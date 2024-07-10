import { type Metadata } from "next";
import { MusicKit } from "~/components/ui/MusicKit";
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
  const { data: kits } = await supabase
    .from("kits")
    .select(
      "title:name, downloadURL:download_url, description, type, imageSrc:image_url",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col items-center px-4">
      <div className="w-full max-w-[1200px]">
        <div className="mt-10 flex w-full flex-col gap-2 text-left">
          <h2 className="text-4xl font-bold">Free Kits</h2>
          <p className="max-w-[1000px] text-muted">
            Here you can find free kits for making beats. Each kit is comprised
            of entirely original samples, synthesizer presets, and melodies
            created by Playportal.
          </p>
        </div>

        <div className="mt-24 grid w-full grid-flow-row grid-cols-1 justify-items-center gap-14 md:grid-cols-2 md:justify-items-stretch lg:grid-cols-3 xl:grid-cols-4">
          {kits?.map((kit) => (
            <MusicKit key={kit.title} {...kit} variant="default" />
          ))}
        </div>
      </div>
    </div>
  );
}
