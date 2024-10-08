import "~/styles/globals.css";
import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import DashboardNavbar from "~/components/ui/DashboardNavbar/DashboardNavbar";
import Providers from "~/providers/providers";
import { getStatusRedirect, getURL } from "~/utils/utils";
import { createClient } from "~/utils/supabase/server";
import NextTopLoader from "nextjs-toploader";

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
  // Might the error relate to me using supabase server client, and it's not getting the cookies
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  //* Since this layout is on the server-side, the user will not even end up on the dashboard route at all, they'll just be instantly redirected
  if (!user ?? error) {
    console.log("User not found, redirecting to sign-in");
    console.log("Get user error", error);
    return redirect(
      getStatusRedirect(
        getURL("/sign-in"),
        "Please sign in",
        "You must be signed in to access the dashboard.",
      ),
    );
  }

  return (
    <html lang="en">
      <body className={` ${GeistSans.className} bg-black`}>
        <Providers>
          <DashboardNavbar
            user={user}
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

          <div className="flex flex-col items-center ">
            <NextTopLoader color="#BC38FA" showSpinner={false} height={2} />

            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
