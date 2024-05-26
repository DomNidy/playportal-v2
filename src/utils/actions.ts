"use server";

import posthog from "posthog-js";
import { Resend } from "resend";
import { env } from "~/env";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { getErrorRedirect, getStatusRedirect, getURL } from "./utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  resetPasswordForEmailRatelimit,
  signupToMailingListRatelimit,
} from "./upstash/ratelimiters";

export type SignupToMailingListResponse = {
  status: "success" | "error" | "ratelimited";
  text: string;
};

export async function signupToMailingList(
  prevState: SignupToMailingListResponse | null,
  data: FormData,
): Promise<SignupToMailingListResponse> {
  try {
    const headersList = headers();
    const ipIdentifier = headersList.get("x-real-ip");
    const result = await signupToMailingListRatelimit.limit(ipIdentifier ?? "");
    console.log(result);

    const email = data.get("email") as string | undefined;

    if (!email) {
      console.warn("Received signup to mailing list without email address");

      return {
        status: "error",
        text: "Please enter a valid email address.",
      };
    }

    // Apply ratelimiting after we parse form data
    if (!result.success) {
      return {
        status: "ratelimited",
        text: "You're doing that too much, please wait a while.",
      };
    }

    // Create resend client & capture mailing list signup event
    const resend = new Resend(env.RESEND_API_KEY);
    posthog.capture("mailinglist_signup", { email });

    const createContactResponse = await resend.contacts.create({
      email: email,
      audienceId: env.RESEND_PLAYPORTAL_AUDIENCE_ID,
    });

    if (createContactResponse.error) {
      console.error("Error creating contact", createContactResponse.error);

      return {
        status: "error",
        text: "We couldn't sign you up to the mailing list. Please try again.",
      };
    }

    return {
      status: "success",
      text: "You've been added to the mailing list!",
    };
  } catch (err) {
    console.error("Error while signing user up to mailing list", err);
    return {
      status: "error",
      text: "Something went wrong, please try again later.",
    };
  }
}

export async function login(email: string, password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("error", error);

  if (error)
    redirect(
      getErrorRedirect(
        "/sign-in",
        "Failed login",
        "Please verify your login credentials and try again.",
      ),
    );

  revalidatePath("/dashboard", "layout");
  redirect(
    getStatusRedirect(
      "/dashboard",
      "Successfully logged in",
      "Welcome to playportal, you have logged in!",
    ),
  );
}

export async function signUp(
  email: string,
  password: string,
): Promise<{ showConfirmEmail: boolean } | void> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getURL("/auth/callback"),
    },
  });

  console.log("Sign up response", error, email);

  if (error) {
    return redirect(
      getErrorRedirect("/sign-up", "Failed sign-up", error.message),
    );
  } else if (data.session) {
    return redirect(
      getStatusRedirect(
        "/dashboard",
        "Successfully signed up",
        "Welcome to playportal, you are now signed in!",
      ),
    );
  } else if (data.user?.identities && data.user.identities.length == 0) {
    console.warn("User with pre-existing account tried to sign up again");
    return redirect(
      getErrorRedirect(
        "/sign-up",
        "Account already exists",
        "Please sign in with your existing account. Try resetting your password if you forgot it.",
      ),
    );
  } else if (data.user) {
    console.log("User signed up, but needs to confirm email", data.user.id);
    return { showConfirmEmail: true };
  } else {
    return redirect(
      getErrorRedirect(
        "/sign-up",
        "Hmm... something went wrong.",
        "Please try again later or contact support.",
      ),
    );
  }
}

type ResetPasswordForEmailResponse = {
  status: "success" | "error" | "ratelimited";
  text: string;
};

export async function resetPasswordForEmail(
  email: string,
): Promise<ResetPasswordForEmailResponse> {
  try {
    // We should ratelimit this to 4 resets per day, per user
    // We do this because this racks up our resend usage
    const headersList = headers();
    const ipIdentifier = headersList.get("x-real-ip");
    const result = await resetPasswordForEmailRatelimit.limit(
      ipIdentifier ?? "",
    );

    console.log(result);

    console.log(ipIdentifier, "requested");

    // If the ip has exceeded their ratelimit, return
    if (!result.success) {
      return {
        status: "ratelimited",
        text: "You're doing that too much, please wait a few minutes.",
      };
    }

    const supabase = createClient();

    // Send the password reset instructions to users' email
    const { error: errorResettingPassword } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getURL("/auth/reset-password"),
      });

    // Reset the ratelimit for the user if we encountered a failure while trying to reset their password
    //* Note: A user could potentially spam us still if they find a way to cause supabase to error out, and we just reset their ratelimit state
    //* Note: We should also avoid resetUsedTokens calls on a potentially null string
    if (errorResettingPassword) {
      console.warn(
        "An error occured while trying to reset the password for the email",
        email,
      );
      console.error(errorResettingPassword);

      // Reset tokens if the ip is defined
      if (ipIdentifier) {
        console.log(
          "Resetting ratelimit for ip",
          ipIdentifier,
          "for reset password limiter",
        );

        await resetPasswordForEmailRatelimit.resetUsedTokens(ipIdentifier);
      } else {
        console.log("Ip is undefined, we cannot reset ratelimit state for it");
      }

      return {
        status: "error",
        text: "Something went wrong while trying to reset your password, please try again.",
      };
    }

    return {
      status: "success",
      text: "If an email with that password has an account, we've sent them an email with instructions on how to reset their password.",
    };
  } catch (err) {
    console.error(
      "Error occured while trying to reset password for email",
      err,
    );
    return {
      status: "error",
      text: "Something went wrong, please try again later or contact support.",
    };
  }
}
