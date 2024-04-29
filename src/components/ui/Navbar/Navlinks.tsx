"use client";

import { type User } from "@supabase/supabase-js";
import { DashboardButton } from "./DashboardButton";

export default function Navlinks({ user }: { user: User | null }) {
  return (
    <div>
      <DashboardButton user={user} />
    </div>
  );
}
