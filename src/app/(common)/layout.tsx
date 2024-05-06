import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { getURL } from "~/utils/helpers";
import Providers from "~/providers/providers";
import { Suspense } from "react";
import Navbar from "~/components/ui/Navbar";
import { NavbarPlaceholder } from "~/components/ui/Navbar/Navbar";

const meta = {
  title: "Playportal",
  description: "The type-beat video creation tool.",
  icons: [{ rel: "icon", url: "/icon.png" }],
  favicon: "/icon.png",
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
      <body className={`dark ${GeistSans.className} bg-black`}>
        <Suspense fallback={<NavbarPlaceholder />}>
          <Navbar />
        </Suspense>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
