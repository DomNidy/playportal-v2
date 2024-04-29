"use client";
import { useQuery } from "@tanstack/react-query";
import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import UserCard from "~/components/ui/UserCard/user-card";
import useAuth from "~/hooks/use-auth";
import { createClient } from "~/utils/supabase/client";

export default function Dashboard() {
  const auth = useAuth();
  const supabase = createClient();

  const userData = useQuery({
    queryKey: ["user", "data"],
    queryFn: async () => {
      if (!auth.user) {
        return;
      }

      const { data } = await supabase
        .from("user_data")
        .select("credits")
        .single();

      return data?.credits;
    },
  });

  return (
    <div>
      <h1 className="text-4xl font-bold ">Dashboard</h1>
      <UserCard user={auth.user} />
      <h2 className="text-2xl font-bold">Latest Posts</h2>
      <p>Credits: {userData.data}</p>
      <CreateVideoForm />
    </div>
  );
}
