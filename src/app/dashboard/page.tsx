import { Suspense } from "react";
import UserCard from "~/components/ui/UserCard/user-card";
import { createClient } from "~/utils/supabase/server";

export default function Dashboard() {
  const supabase = createClient();

  return (
    <div>
      <h1 className="text-4xl font-bold ">Dashboard</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UserCard />
      </Suspense>
    </div>
  );
}
