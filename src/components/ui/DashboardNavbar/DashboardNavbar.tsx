import { type User } from "@supabase/supabase-js";
import UserButton from "../UserButton/UserButton";
import { DashboardNavbarLinks } from "./DashboardNavbarLinks";
import { createClient } from "~/utils/supabase/server";
import { Link } from "../Link";
import PlayportalIcon from "../../../../public/playportal.svg";
import Image from "next/image";

export type DashNavLink = {
  href: string;
  text: string;
};

export default async function DashboardNavbar({
  links,
  user,
}: {
  links: DashNavLink[];
  user: User | null;
}) {
  const supabase = createClient();

  // Fetch user data
  const { data: userData, error: fetchUserDataError } = await supabase
    .from("user_data")
    .select("*")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (fetchUserDataError) {
    console.error("Error fetching user data", fetchUserDataError);
  }

  return (
    <div className="sticky top-0 z-[44] m-auto mb-4 flex h-fit w-full shrink-0 flex-col border-b border-b-white/20 bg-neutral-950 px-4 pb-0 md:px-6">
      <div className="mt-4 flex h-12 w-full flex-row justify-between font-semibold tracking-tight">
        <div className="flex flex-row items-center justify-center gap-2">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Image priority src={PlayportalIcon} alt="" />
          <Link href="/">Playportal</Link>
        </div>
        <div className="top-0 flex flex-row items-start justify-center gap-4">
          <UserButton user={userData} />
        </div>
      </div>
      <div className="mt-3.5 flex gap-8">
        <DashboardNavbarLinks links={links} />
      </div>
    </div>
  );
}
