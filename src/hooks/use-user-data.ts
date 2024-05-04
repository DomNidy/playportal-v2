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
        return null;
      }

      const creds = await supabase
        .from("user_data")
        .select("credits")
        .eq("id", auth.user.id)
        .single()
        .then((res) => res.data?.credits);

      const { data } = await supabase
        .from("operations")
        .select("*")
        .eq("user_id", auth.user.id)
        .eq("status", "Ongoing")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        credits: creds ?? 0,
        activeOperationId: data?.id ?? null,
      };
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
