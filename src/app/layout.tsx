import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { Toaster } from "~/components/ui/Toasts/toaster";
import { TRPCReactProvider } from "~/trpc/react";
import type { Metadata } from "next";
import { getURL } from "~/utils/helpers";
import { Suspense } from "react";
import Providers from "~/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const meta = {
  title: "SaaS Starter",
  description: "This is the SaaS starter project",
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
    keywords: ["nextjs", "saas", "vercel"],
    authors: [{ name: "My Name", url: "https://my-website.com" }],
    creator: "SaaS Starter",
    publisher: "SaaS Starter",
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
      site: "@my-twitter",
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
      <body className={`font-sans ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
