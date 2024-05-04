import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { IBM_Plex_Sans_Thai_Looped } from "next/font/google";
import type { Metadata } from "next";
import { getURL } from "~/utils/helpers";
import Providers from "~/providers/providers";

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui"],
});

export const meta = {
  title: "Playportal",
  description: "The type-beat video creation tool.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  favicon: "../../public/favicon.ico",
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
      "loop kits",
      "tunestotube",
      "producer tools",
    ],
    authors: [{ name: "Dom Nidy", url: "https://my-website.com" }],
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
      creator: "@my-twitter",
      title: meta.title,
      description: meta.description,
      images: [meta.favicon],
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
      <body className={` ${ibmPlexSansThaiLooped.className} bg-black`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
