import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { authContext } from "~/providers/auth-provider";
import { createClient } from "~/utils/supabase/client";

export default function useUserData() {
  const context = useContext(authContext);
  const supabase = createClient();

  if (context === undefined) {
    throw new Error("useUserData must be used within a AuthProvider");
  }

  return useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      if (!context.user) {
        return;
      }

      const { data } = await supabase
        .from("user_data")
        .select("credits")
        .eq("id", context.user.id)
        .single();

      return data?.credits;
    },
    refetchOnWindowFocus: "always",
  });
}
