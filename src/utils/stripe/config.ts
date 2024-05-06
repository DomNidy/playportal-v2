import Stripe from "stripe";
import { env } from "~/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  // https://stripe.com/docs/api/versioning
  // @ts-expect-error - If set to null, Stripe will automatically use the latest API version.
  apiVersion: null,
  appInfo: {
    name: "Playportal",
    version: "0.0.0",
    url: "https://www.playportal.app/",
  },
});
