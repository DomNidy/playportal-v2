"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "~/utils/supabase/client";

// Hook which returns query data about the users subscription status
export function useUserSubscription() {
  const supabase = createClient();

  const subscriptionQuery = useQuery({
    queryKey: [["user", "getSubscription"]],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("user_products")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .maybeSingle();

      return data;
    },
  });

  return subscriptionQuery;
}
