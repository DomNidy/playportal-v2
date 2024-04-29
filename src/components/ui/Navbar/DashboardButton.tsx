"use client";

import { type User } from "@supabase/supabase-js";
import Link from "next/link";

// Dynamic navlink section

// Button that will either take the user to the signup/signin page, or the dashboard, depending on their auth state
export function DashboardButton({ user }: { user: User | null }) {
  if (user) {
    return (
      <Link
        href={"/dashboard"}
        className="rounded-lg bg-primary px-4 py-2 font-medium tracking-tight text-background hover:bg-primary/90 "
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href={"/sign-in"}
      className="rounded-lg bg-primary px-4 py-2 font-medium tracking-tight  text-background hover:bg-primary/90 "
    >
      Sign in
    </Link>
  );
}
