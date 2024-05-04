"use client";
import { createClient } from "~/utils/supabase/client";
import { Button } from "../Button";
import { type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getStatusRedirect } from "~/utils/helpers";
import { Label } from "../Form";

// This is a client component, but will be provided the props from a server components
export default function UserCard({
  user,
  userCredits,
}: {
  user: User | null;
  userCredits: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  return (
    <div className="flex w-fit flex-col rounded-lg border-2 border-border  p-4">
      <p className="text-sm font-bold">{user?.email ?? "Not logged in"}</p>
      <p className="text-sm">{user?.id}</p>
      <Button
        onClick={() => {
          void supabase.auth.signOut().then((res) => {
            if (res.error) {
              console.error(res.error);
            } else {
              const redirectPath = getStatusRedirect(
                "/sign-in",
                "Signed out",
                "You've successfully signed out",
              );
              router.replace(redirectPath);
            }
          });
        }}
      >
        Sign out
      </Button>
      <Label className="mt-2">
        Credits: <span>{userCredits}</span>
      </Label>
    </div>
  );
}
