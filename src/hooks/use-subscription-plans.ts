// Hook which returns available subscription plans

import { useQuery } from "@tanstack/react-query";
import { env } from "~/env";
import { createClient } from "~/utils/supabase/client";

export function useSubscriptionPlans() {
  const supabase = createClient();

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products_prices")
        .select("*")
        .eq("product_active", true);

      if (!products ?? error) {
        return null;
      }

      const basicPlan = products?.find(
        (product) =>
          product.product_id == env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_BASIC_PLAN,
      );

      const standardPlan = products?.find(
        (product) =>
          product.product_id == env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_STANDARD_PLAN,
      );

      const proPlan = products?.find(
        (product) =>
          product.product_id == env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PRO_PLAN,
      );

      return {
        basicPlan,
        standardPlan,
        proPlan,
      };
    },
  });

  return subscriptionsQuery;
}
