"use client";

import { type User } from "@supabase/supabase-js";
import Link from "next/link";

// Dynamic navlink section

// Button that will either take the user to the signup/signin page, or the dashboard, depending on their auth state
export function DashboardButton({ user }: { user: User | null }) {
  if (user) {
    return (
      <div className="ml-auto rounded-3xl bg-gradient-to-b  to-transparent p-px">
        <div className="rounded-[calc(1.5rem-1px)]  p-4">
          {/** Swapping the next/Link component for a default button makes the styling fixed, but as link, the background doesnt work? */}
          <Link
            className="flex rounded bg-gradient-to-b from-colors-accent-300 to-colors-secondary-300 p-[1.5px] font-semibold text-white transition-all"
            href={"/dashboard"}
          >
            <span className="flex w-full rounded bg-black px-3 py-1 text-base font-medium tracking-tight text-white hover:bg-gradient-to-b">
              Dashboard
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-auto rounded-3xl bg-gradient-to-b  to-transparent p-px">
      <div className="rounded-[calc(1.5rem-1px)]  p-4">
        {/** Swapping the next/Link component for a default button makes the styling fixed, but as link, the background doesnt work? */}
        <Link
          className="flex rounded bg-gradient-to-b from-colors-accent-300 to-colors-secondary-300 p-[1.5px] font-semibold text-white transition-all"
          href={"/sign-in"}
        >
          <span className="flex w-full rounded bg-black px-3 py-1 text-base font-medium tracking-tight text-white hover:bg-gradient-to-b ">
            Sign in
          </span>
        </Link>
      </div>
    </div>
  );
}
