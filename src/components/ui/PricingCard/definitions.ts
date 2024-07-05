import { type Tables } from "types_db";

export type PricingPlan = {
  planName: string;
  planPrice: number;
  // A <p> element, we pass it this way because we want to apply custom styling to it
  planDescription: React.ReactNode;
  // An array of <p> elements, we pass them this way because we want to apply custom styling to certain parts of each element
  planFeatures: React.ReactNode[];
  planData: Tables<"products_prices">;
  // Whether or not the current authenticated user owns the plan (if one is authenticated)
  currentUserOwnsPlan?: boolean;
};
