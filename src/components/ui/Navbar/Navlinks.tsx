"use client";

import { type User } from "@supabase/supabase-js";
import { DashboardButton } from "./DashboardButton";

export default function Navlinks({ user }: { user: User | null }) {
  return (
    <div className="flex w-full ">
      <DashboardButton user={user} />
    </div>
  );
}
