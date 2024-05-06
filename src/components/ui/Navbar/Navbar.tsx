import { createClient } from "~/utils/supabase/server";
import Navlinks from "./Navlinks";
import Link from "next/link";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className=" sticky top-0 z-40 flex h-16 w-full flex-row items-center justify-center border-b-[1px] border-colors-background-900 bg-black px-24 py-8">
      <Link
        className="mr-auto gap-1 text-[1rem] font-medium tracking-tighter sm:text-[1.5rem]"
        href={"/"}
      >
        Playportal
      </Link>
      <Navlinks user={user} />
    </div>
  );
}

// Used for loading state
export function NavbarPlaceholder() {
  return (
    <div className="container sticky top-0 z-40 flex h-16 flex-row items-center justify-center px-24 py-8 backdrop-blur-lg">
      <h1 className="mr-auto gap-1 text-2xl font-bold tracking-tighter sm:text-[2rem]">
        Playportal
      </h1>
    </div>
  );
}
