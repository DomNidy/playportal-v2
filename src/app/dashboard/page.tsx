import { Suspense } from "react";
import UserCard from "~/components/ui/UserCard/user-card";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold ">Dashboard</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UserCard />
      </Suspense>
    </div>
  );
}
