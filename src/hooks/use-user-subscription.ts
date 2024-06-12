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

      if (!user) {
        console.log("No user found");
        return null;
      }

      const { data } = await supabase
        .from("user_products")
        .select("*")
        .in("sub_status", ["active", "trialing"])
        .eq("user_id", user.id)
        .order("sub_current_period_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      return data;
    },
  });

  return subscriptionQuery;
}
