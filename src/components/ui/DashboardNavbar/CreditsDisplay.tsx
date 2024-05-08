"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "~/utils/supabase/client";

// Fetches the credits a user has, and display that on the ui
export default function CreditsDisplay({
  userId,
  // Since our navbar is a server component, we can use the initial data returned in there, and pass it to this component
  // This allows us to instantly display a users credits on page load, and then use react query to refetch as needed
  initialCredits,
}: {
  userId: string;
  initialCredits: number;
}) {
  const supabase = createClient();

  const userCreditsQuery = useQuery({
    queryKey: ["userCredits"],
    queryFn: async () =>
      supabase
        .from("user_data")
        .select("credits")
        .eq("id", userId)
        .single()
        .then((res) => res.data?.credits ?? null),
  });

  return (
    <p className="mt-1 text-center text-sm tracking-normal text-white/70">
      Credits: {userCreditsQuery.data ?? initialCredits}
    </p>
  );
}
