"use server";
import { Suspense } from "react";
import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import UserCard from "~/components/ui/UserCard/user-card";
import { api } from "~/trpc/server";
import { createClient } from "~/utils/supabase/server";

export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await api.post.getLatest();

  return (
    <div>
      <h1 className="text-4xl font-bold ">Dashboard</h1>
      <UserCard user={user} />
      <h2 className="text-2xl font-bold">Latest Posts</h2>
      {posts.map((post, idx) => (
        <div key={idx}>
          {post.author_id} {post.content} {post.created_at}
        </div>
      ))}
      <Suspense fallback={<p>Loading..</p>}>
        <CreateVideoForm />
      </Suspense>
    </div>
  );
}
