import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { getURL } from "~/utils/utils";
import Providers from "~/providers/providers";
import { Suspense } from "react";
import LandingPageNavbar, {
  LandingPageNavbarFallback,
} from "~/components/ui/LandingPage/LandingPageNavbar";
import NextTopLoader from "nextjs-toploader";

const meta = {
  title: "Playportal | Type-Beat Video Creation Tool",
  description:
    "The type-beat video creation tool for music producers. Upload your beats, an optional image, and we'll render it into a video on our servers. Stay consistent with your uploads and grow your audience on YouTube, Instagram, and TikTok.",
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
      "make type beat video",
      "tunestotube alternative",
      "upload audio to youtube",
      "upload mp3 to youtube",
      "upload wav to youtube",
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
    verification: {
      google: "Pw3v_VbZW-y0UMRlbaBBY5ADR5G2rRhyNUm3ar1FyuU",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={` ${GeistSans.className} bg-neutral-950 `}>
        <Suspense fallback={<LandingPageNavbarFallback />}>
          <LandingPageNavbar />
        </Suspense>
        <Providers>
          <NextTopLoader color="#2175d5" showSpinner={false} height={2} />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
