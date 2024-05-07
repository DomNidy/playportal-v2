import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { type Database } from "types_db";
import { authContext } from "~/providers/auth-provider";
import { createClient } from "~/utils/supabase/client";

export default function useUserData() {
  const auth = useContext(authContext);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      if (!auth.user) {
        return null;
      }

      console.log("Fetching query", auth);
      const userData = await supabase
        .from("user_data")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      const { data } = await supabase
        .from("operations")
        .select("*")
        .eq("user_id", auth.user.id)
        .eq("status", "Ongoing")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        userData: {
          avatar_url: userData.data?.avatar_url,
          id: userData.data?.id,
          credits: userData.data?.credits,
          full_name: userData.data?.full_name,
        } as Database["public"]["Tables"]["user_data"]["Row"],
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

  return {
    userData: query,
    auth: auth,
  };
}
