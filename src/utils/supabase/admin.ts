import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { Tables, Database, TablesInsert } from "types_db";
import { env } from "~/env";
import { stripe } from "../stripe/config";
import { toIsoStringOrNull } from "../utils";

export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE,
);

// Call this with stripe product data to update the data in our database
export async function upsertProductRecord(product: Stripe.Product) {
  // TODO: Parse the `product.metadata`, use that to relate this product to a `product_roles` record

  const productData: Tables<"products"> = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  const { error: upsertError } = await supabaseAdmin
    .from("products")
    .upsert([productData]);

  if (upsertError)
    throw new Error(`Product insert/update failed: ${upsertError.message}`);
  console.log(`Product inserted/updated: ${product.id}`);
}

// Updates the price record in supabase
// Each price is associated with a stripe product
// A stripe product can have many prices
export async function upsertPriceRecord(
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3,
) {
  const priceData: Tables<"prices"> = {
    id: price.id,
    product_id: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days:
      price.recurring?.trial_period_days ?? env.STRIPE_TRIAL_PERIOD_DAYS,
    description: null,
    metadata: null,
  };

  const { error: upsertError } = await supabaseAdmin
    .from("prices")
    .upsert([priceData]);

  // We allow retries when foreign key constraints occur just incase our webhook that updates the price gets fired before the webhook that creates the product
  // Sometimes, these events may occur simulatenously it seems
  if (upsertError?.message.includes("foreign key constraint")) {
    if (retryCount < maxRetries) {
      // Wait 2 seconds and retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      throw new Error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`,
      );
    }
  } else if (upsertError) {
    // Handle the case where an error occured upserting that was not relating to a fk constraint
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Price inserted/updated: ${price.id}`);
  }
}

export async function deletePriceRecord(price: Stripe.Price) {
  const { error: deleteError } = await supabaseAdmin
    .from("prices")
    .delete()
    .eq("id", price.id);

  if (deleteError)
    throw new Error(`Price deletion failed: ${deleteError.message}`);
  console.log(`Price deleted: ${price.id}`);
}

export async function deleteProductRecord(product: Stripe.Product) {
  const { error: deleteError } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", product.id);

  if (deleteError) throw new Error(`Product deletion failed: ${product.id}`);
  console.log(`Product deleted: ${product.id}`);
}

export async function upsertCustomerToSupabase(
  uuid: string,
  customerId: string,
) {
  const { error: upsertError } = await supabaseAdmin
    .from("customers")
    .upsert([{ id: uuid, stripe_customer_id: customerId }]);

  if (upsertError)
    throw new Error(
      `Supabase customer record creation failed: ${upsertError.message}`,
    );

  return customerId;
}

export async function createCustomerInStripe(uuid: string, email: string) {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email };
  const newCustomer = await stripe.customers.create(customerData);

  if (!newCustomer) throw new Error(`Stripe customer creation failed.`);

  return newCustomer.id;
}

/**
 * Try to retrieve the Stripe customer ID using our Supabase UUIDs
 * We use email as a fallback mechanism incase we are unable to find the Stripe customer using their Supabase UUID
 */
export async function createOrRetrieveCustomer({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) {
  // Check if customer already exists in Supabase
  const { data: existingSupabaseCustomer, error: queryError } =
    await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", uuid)
      .maybeSingle();

  if (queryError) {
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  // Retrieve the stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id,
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({ email: email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0]?.id : undefined;
  }

  // If we still could not find a stripeCustomerId, create a new customer in stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);
  if (!stripeIdToInsert) throw new Error("Stripe customer creation failed.");

  if (existingSupabaseCustomer && stripeCustomerId) {
    // If Supabase has a record, but doesn't match Stripe, update Supabase record
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      const { error: updateError } = await supabaseAdmin
        .from("customers")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", uuid);

      if (updateError)
        throw new Error(
          `Supabase customer record update failed: ${updateError.message}`,
        );
      console.warn(
        `Supabase customer record mismatched Stripe ID. Supabase record updated.`,
      );
    }
    // If supabase has a record and matches Stripe, return Stripe customer ID
    return stripeCustomerId;
  } else {
    console.warn(
      `Supabase customer record was missing. A new record wascreated`,
    );

    // If supabase has no record, create a new record and return Stripe customer ID
    const upsertedStripeCustomer = await upsertCustomerToSupabase(
      uuid,
      stripeIdToInsert,
    );

    if (!upsertedStripeCustomer)
      throw new Error("Supabase customer record creation failed.");

    return upsertedStripeCustomer;
  }
}

/**
 * Copies the billing details from the payment method to the customer object
 */
export async function copyBillingDetailsToCustomer(
  uuid: string,
  payment_method: Stripe.PaymentMethod,
) {
  // TODO: Check this assertion
  const customer = payment_method.customer as string;

  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;

  // These null checks are probably unnecessary due to the previous checks, but i don't want to use ignore linter rules to suppress them
  await stripe.customers.update(customer, {
    name,
    phone,
    address: {
      city: address.city ?? undefined,
      country: address.country ?? undefined,
      line1: address.line1 ?? undefined,
      line2: address.line2 ?? undefined,
      postal_code: address.postal_code ?? undefined,
      state: address.state ?? undefined,
    },
  });

  // Update customer's billing details
  const { error: updateError } = await supabaseAdmin
    .from("user_data")
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] },
    })
    .eq("id", uuid);
  if (updateError)
    throw new Error(`Customer update failed: ${updateError.message}`);
}

// We call this with a stripe customer id, then use that to look up the user in supabase via the customers table
// Then we sync that users' subscription status with the status on supabase
export async function manageSubscriptionStatusChange(
  subscriptionId: string, // Id of a subscription (these are associated with individual users) and are stored on stripe
  customerId: string, // Stripe customer ID
  createAction = false,
) {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (noCustomerError)
    throw new Error(
      `Customer lookup failed: ${noCustomerError.message} for stripe customer id ${customerId}`,
    );

  const { id: uuid } = customerData;

  // Get the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method", "plan.product"],
  });

  // TODO: If the subscription.status is not active, we should remove the users' role

  // Upsert the latest status of the subscription object into Supabase.
  const subscriptionData: TablesInsert<"subscriptions"> = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    //* This is how we link the user to the product they purchased
    price_id: subscription.items.data[0]?.price.id,
    // TODO: Check quantity on subscription
    // @ts-expect-error Review that the subscription object retrieved from stripe actually has a quantity
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: toIsoStringOrNull(subscription.cancel_at),
    canceled_at: toIsoStringOrNull(subscription.canceled_at),
    current_period_start:
      toIsoStringOrNull(subscription.current_period_start) ?? undefined,
    current_period_end:
      toIsoStringOrNull(subscription.current_period_end) ?? undefined,
    created: toIsoStringOrNull(subscription.created) ?? undefined,
    ended_at: toIsoStringOrNull(subscription.ended_at),
    trial_start: toIsoStringOrNull(subscription.trial_start),
    trial_end: toIsoStringOrNull(subscription.trial_end),
  };

  const { error: upsertError } = await supabaseAdmin
    .from("subscriptions")
    .upsert([subscriptionData]);

  if (upsertError)
    throw new Error(
      `Subscription insert/update failed: ${upsertError.message}`,
    );
  console.log(
    `Inserted/updated subscription: [${subscription.id}] for user [${uuid}]`,
  );

  console.log(
    `Subscription status [${subscription.status}] for subscription [${subscription.id}]`,
  );

  // Extract the from the subscription object
  // @ts-expect-error We are using expand in the subscription query above, but we don't know that our response actually includes it
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const subscriptionProductData = subscription?.plan?.product as Stripe.Product;

  if (!subscriptionProductData) {
    throw new Error(
      `Subscription object retrieved from stripe does not include product data, subscription id: ${subscription.id}. Need to manually add the users' role now.`,
    );
  }

  // With the product_id, query the roles table to find the role related to that product, select the role id
  const { data: roleId } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("for_plan", subscriptionProductData.id)
    .single();

  if (!roleId?.id) {
    throw new Error(
      `Unable to find role related to the product id: ${subscriptionProductData.id}`,
    );
  }

  // If the status of the subscription is NOT active, then we'll remove the users' role
  // If the status is active, then we'll grant them the associated role
  if (subscription.status === "active") {
    console.log(
      "Status is active, upserting userRole to grant user the role",
      roleId.id,
    );

    const { error: upsertUserRoleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        granted_role: roleId.id,
        user_id: uuid,
      });

    if (upsertUserRoleError)
      throw new Error(
        `Error granting the user [${uuid}] their role, role id [${roleId.id}]. We need to manually give them their role.`,
      );
  } else {
    console.log(
      "Status is cancelled, upserting userRole to delete the user role",
      roleId.id,
      "for user",
      uuid,
    );

    const deleteUserRole = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", uuid)
      .eq("granted_role", roleId.id);

    console.log(deleteUserRole);

    if (deleteUserRole?.error)
      throw new Error(
        `Error removing users role, their subscription status is no longer active, but we couldnt't remove their role in the DB. Subscription id: ${subscription.id}, User id: ${uuid}`,
      );
  }

  // For a new subscription, copy the billing details to the customer object.
  //* NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid) {
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod,
    );
  }
}
