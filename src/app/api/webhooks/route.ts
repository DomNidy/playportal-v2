import { Stripe } from "stripe";
import { env } from "~/env";
import { stripe } from "~/utils/stripe/config";

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
        // TODO: Handle this here
        case "price.created":
        case "price.updated":
        // TODO: Handle this here
        case "price.deleted":
        // TODO: Handle this here
        case "product.deleted":
        // TODO: Handle this here
        case "customer.subscription.created":
            console.log("Received")
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        // TODO: Handle this here
        case "checkout.session.completed":
        // TODO: Handle this here
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
