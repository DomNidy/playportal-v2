import { createClient } from "~/utils/supabase/server";

export default async function UserCard() {
  const supabase = createClient();

  const user = await supabase.auth.getUser();

  if (!user) {
    return <p>No user</p>;
  }

  return (
    <div className="flex w-fit flex-col rounded-lg border-2 border-border bg-secondary p-4">
      <p className="text-lg font-bold">{user.data.user?.email}</p>
      <p className="text-sm">{user.data.user?.id}</p>
    </div>
  );
}
