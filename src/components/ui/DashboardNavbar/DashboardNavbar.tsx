import { redirect } from "next/navigation";
import UserButton from "../UserButton/UserButton";
import { createClient } from "~/utils/supabase/server";
import { DashboardNavbarLinks } from "./DashboardNavbarLinks";

export type DashNavLink = {
  href: string;
  text: string;
};

export default async function DashboardNavbar({
  links,
}: {
  links: DashNavLink[];
}) {
  const supabase = createClient();

  const userDataResponse = await supabase.auth.getUser().then(async (res) => {
    if (res.data?.user) {
      return await supabase
        .from("user_data")
        .select("*")
        .eq("id", res.data.user.id)
        .single();
    }
  });

  // If we cant fetch user data, redirect to sign in
  if (!userDataResponse?.data?.id) redirect("/sign-in");

  return (
    <div className="sticky top-0 z-50 m-auto mb-4 flex h-fit w-full shrink-0 flex-col border-b bg-neutral-950 px-4 pb-0 md:px-6">
      <div className="mt-4 flex h-12 w-full flex-row justify-between font-semibold tracking-tight">
        Playportal
        <div className="top-0 flex flex-row items-start justify-center gap-4">
          <UserButton user={userDataResponse.data} />
        </div>
      </div>
      <div className="mt-auto flex gap-8">
        <DashboardNavbarLinks links={links} />
      </div>
    </div>
  );
}
