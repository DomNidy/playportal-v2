import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { env } from "~/env";

let stripePromise: Promise<Stripe | null>;

export const getStripe = async () => {
  if (!(await stripePromise)) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }

  return stripePromise;
};
