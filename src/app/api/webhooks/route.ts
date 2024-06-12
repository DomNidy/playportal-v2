import { type Stripe } from "stripe";
import { env } from "~/env";
import { stripe } from "~/utils/stripe/config";
import {
  deletePriceRecord,
  deleteProductRecord,
  deleteSupabaseCustomer,
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord,
} from "~/server/helpers/supabase/stripe-event-handlers";

// All events we receive from stripe will be sent here
// Things such as customer payments, us updating our prices, etc.
// The exact events we are interested in receiving are listed below
const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.created",
  "customer.deleted ",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;
  try {
    if (!sig || !webhookSecret)
      return new Response("Webhook Error: Missing secret", { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const message = err?.message ?? "Failed to parse error message";
    console.log(`❌ Error message: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Check if event is relevant
  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object);
          break;
        case "price.deleted":
          await deletePriceRecord(event.data.object);
          break;
        case "product.deleted":
          await deleteProductRecord(event.data.object);
          break;
        case "customer.created":
          // Do nothing
          console.log("Customer created on stripe");
          break;
        case "customer.deleted":
          console.log(
            `Customer was deleted on stripe: ${event.data.object.id}`,
          );
          await deleteSupabaseCustomer(event.data.object.id);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await manageSubscriptionStatusChange(
            event.data.object.id,
            event.data.object.customer as string,
            event.type === "customer.subscription.created", // TODO: Why do we pass this here? Wouldn't this always be false? (since customer.subscription.created is different from the enumerated value)
          );
          break;
        case "checkout.session.completed":
          console.log("Checkout session completed");
          const checkoutSession = event.data.object;
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true,
            );
          }
          break;
        default:
          throw new Error("Unhandled relevant event type.");
      }
    } catch (err) {
      console.log(err);
      return new Response("Webhook handler failed. View logs.", {
        status: 400,
      });
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ received: true }));
}
