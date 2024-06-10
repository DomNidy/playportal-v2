"use server";

import type Stripe from "stripe";
import { stripe } from "~/utils/stripe/config";
import { createClient } from "~/utils/supabase/server";
import { createOrRetrieveCustomer } from "~/server/helpers/supabase/stripe-event-handlers";
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp,
  getStatusRedirect,
} from "~/utils/utils";
import type { Tables } from "types_db";

type Price = Tables<"prices">;

// Function which tries to retrieve the name of a stripe product from it's price id, returns null if the product name cannot be found
// Note: This is useful for cases where we don't necessarily need the product name, and don't want to error out if we can't find it
async function getProductNameFromPriceID(
  priceId: string,
): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: productData, error: fetchProductDataError } = await supabase
      .from("prices")
      .select(`products (name)`)
      .eq("id", priceId)
      .maybeSingle();

    if (fetchProductDataError) throw new Error(fetchProductDataError.message);

    return productData?.products?.name ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Function which returns a status message that will be displayed in toast on redirect after a user subscribes to stripe
function generateSubscribtionRedirectMessage(productName: string | null) {
  if (productName) {
    return `Thank you for subscribing, you're now a ${productName} subscriber! Let's make some music!`;
  }
  return `Thank you for subscribing! Let's make some music!`;
}

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

export async function checkoutWithStripe(
  price: Price,
  redirectPath = "/dashboard",
): Promise<CheckoutResponse> {
  console.log("Checkout with stripe initiated", price, redirectPath);
  try {
    // Get the user from Supabase auth
    const supabase = createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    // Try to get product name (if we can't find it, we'll just display a message on redirect toast)
    const productName = await getProductNameFromPriceID(price.id);
    // Displayed in the toast on redirect
    const redirectStatusMessage =
      generateSubscribtionRedirectMessage(productName);

    if (error ?? !user) {
      console.error(error);
      console.error("Could not get user session.");
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id ?? "",
        email: user?.email ?? "",
      });
    } catch (err) {
      console.error(err);
      throw new Error("Unable to access customer record.");
    }

    // Create the appropriate params for the checkout session
    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer,
      customer_update: {
        address: "auto",
      },
      line_items: [{ price: price.id, quantity: 1 }],
      cancel_url: getURL(),
      success_url: getStatusRedirect(
        getURL(redirectPath),
        "You've subscribed!",
        redirectStatusMessage,
      ),
    };

    if (price.type === "recurring") {
      params = {
        ...params,
        mode: "subscription",
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days),
        },
      };
    } else if (price.type === "one_time") {
      params = {
        ...params,
        mode: "payment",
      };
    }

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error(err);
      throw new Error("Unable to create checkout session.");
    }

    // Instead of returning a Response, just return the data or error.
    if (session) {
      return { sessionId: session.id };
    } else {
      throw new Error("Unable to create checkout session");
    }
  } catch (err) {
    if (err instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          err.message,
          "Please try again later or contact support.",
        ),
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          "An unknown error occured",
          "Please try again later or contact support.",
        ),
      };
    }
  }
}

export async function createStripePortal(currentPath: string) {
  console.log("Got current path", currentPath);

  try {
    const supabase = createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (error) {
        console.error(error);
      }
      throw new Error("Could not get user session.");
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id ?? "",
        email: user?.email ?? "",
      });
    } catch (err) {
      console.error(err);
      throw new Error("Unable to access customer record.");
    }

    if (!customer) {
      throw new Error("Could not get customer.");
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL(currentPath),
      });

      if (!url) {
        throw new Error("Could not create billing portal.");
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error("Could not create billing portal.");
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);
      return getErrorRedirect(
        currentPath,
        err.message,
        "Please try again later or contact a system administrator.",
      );
    } else {
      return getErrorRedirect(
        currentPath,
        "An unknown error occurred.",
        "Please try again later or contact a system administrator.",
      );
    }
  }
}
