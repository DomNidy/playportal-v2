import { redirect } from "next/navigation";
import DashboardNavbar from "~/components/ui/DashboardNavbar/DashboardNavbar";
import AuthProvider from "~/providers/auth-provider";
import { createClient } from "~/utils/supabase/server";

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
    <AuthProvider>
      <div>
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
      </div>
    </AuthProvider>
  );
}
