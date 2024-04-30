import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "~/utils/supabase/client";
import useAuth from "./use-auth";

export default function useUserData() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      console.log("Fetching query", auth);
      if (!auth.user) {
        return 0;
      }

      const creds = supabase
        .from("user_data")
        .select("credits")
        .eq("id", auth.user.id)
        .single()
        .then((res) => res.data?.credits);

      return creds ?? 0;
    },
    refetchOnWindowFocus: "always",
    retryOnMount: true,
  });

  // Invalidate the query whenever auth state changes
  useEffect(() => {
    void queryClient.invalidateQueries({
      queryKey: ["userData"],
    });
  }, [auth.user?.id, queryClient]);

  return query;
}
