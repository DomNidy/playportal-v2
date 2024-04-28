"use client";
import { createClient } from "~/utils/supabase/client";
import { toast } from "../Toasts/use-toast";
import { type FormEvent, useEffect } from "react";
import { Input } from "../Input";
import useAuth from "~/hooks/use-auth";

export default function UserCard() {
  const supabase = createClient();

  const { user } = useAuth();

  useEffect(() => {
    const subscription = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (inserts) => {
          console.log(inserts.new);
        },
      )
      .subscribe((status) => {
        if (status == "SUBSCRIBED") {
          toast({
            title: "Subscribed",
            description: "You have subscribed to posts",
          });
        } else {
          toast({
            title: "Unsubscribed",
            description: "You have unsubscribed from posts",
          });
        }
      });

    return () => {
      void subscription.unsubscribe();
    };
  }, [supabase]);

  if (!user) {
    return <p>No user</p>;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    e.preventDefault();
    e.currentTarget.reset();

    if (!user?.id) {
      toast({
        title: "You must be logged in!",
        description: "Please log in to post",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "You have posted!",
    });

    const { data: id } = await supabase.rpc("gen_id");

    await supabase.from("posts").insert({
      title: "S",
      id: id!,
      author_id: user.id,
      content: formData.get("content") as string,
    });
  }

  return (
    <div className="flex w-fit flex-col rounded-lg border-2 border-border bg-secondary p-4">
      <p className="text-lg font-bold">{user?.email}</p>
      <p className="text-sm">{user?.id}</p>

      <form onSubmit={onSubmit}>
        <Input type="text" name="content"></Input>
      </form>
    </div>
  );
}
