import { DocsLayout } from "fumadocs-ui/layout";
import type { ReactNode } from "react";
import { pageTree } from "source";
import { RootProvider } from "fumadocs-ui/provider";
import { type Metadata } from "next";
import { getURL } from "~/utils/utils";
import { GeistSans } from "geist/font/sans";
import "~/styles/globals.css";

const meta = {
  title: "Playportal | Support",
  description: "Documentatio and support for Playportal, the type-beat video creation tool.",
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

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="">
      <body className={`${GeistSans.className} support-route`}>
        <RootProvider>
          <DocsLayout tree={pageTree} nav={{ title: "Playportal" }}>
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
