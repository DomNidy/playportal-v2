import "~/styles/globals.css";

import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import DashboardNavbar from "~/components/ui/DashboardNavbar/DashboardNavbar";
import AuthProvider from "~/providers/auth-provider";
import Providers from "~/providers/providers";
import { getURL } from "~/utils/utils";
import { createClient } from "~/utils/supabase/server";

const meta = {
  title: "Playportal",
  description: "The type-beat video creation tool.",
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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  //* Since this layout is on the server-side, the user will not even end up on the dashboard route at all, they'll just be instantly redirected
  if (!user) redirect("/sign-in");

  return (
    <html lang="en">
      <body className={` ${GeistSans.className} bg-black`}>
        <AuthProvider initialUser={user}>
          <Providers>
            <DashboardNavbar
              links={[
                {
                  href: "/dashboard",
                  text: "Dashboard",
                },
                {
                  href: "/dashboard/my-videos",
                  text: "Videos",
                },
                {
                  href: "/dashboard/transactions",
                  text: "Transactions",
                },
              ]}
            />

            <div className="flex flex-col items-center ">{children}</div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
