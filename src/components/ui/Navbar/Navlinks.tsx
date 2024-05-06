"use client";

import { type User } from "@supabase/supabase-js";
import { DashboardButton } from "./DashboardButton";
import Link from "next/link";

export default function Navlinks({ user }: { user: User | null }) {
  return (
    <div className="flex  w-full flex-row items-center">
      <div className="ml-20 ">
        <Link href="/downloads" className="text-muted-foreground hover:text-white transition-colors">Downloads</Link>
      </div>
      <div className="ml-auto">
        <DashboardButton user={user} />
      </div>
    </div>
  );
}
