"use server";

import posthog from "posthog-js";
import { Resend } from "resend";
import { env } from "~/env";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { getErrorRedirect, getStatusRedirect, getURL } from "./utils";
import { revalidatePath } from "next/cache";

export type SignupToMailingListResponse = {
  status: "success" | "error";
  text: string;
};

// const mailingListSubscribeRatelimit = new Ratelimit({
//   redis: redis,
//   limiter: Ratelimit.fixedWindow,
// });

// TODO: Ratelimit this using nextjs middleware since we're using server action and cant get the headers
export async function signupToMailingList(
  prevState: SignupToMailingListResponse | null,
  data: FormData,
): Promise<SignupToMailingListResponse> {
  const resend = new Resend(env.RESEND_API_KEY);
  const email = data.get("email") as string | undefined;

  if (!email) {
    console.warn("Received signup to mailing list without email address");

    return {
      status: "error",
      text: "Please enter a valid email address.",
    };
  }

  posthog.capture("waitlist_signup_submit", { email });

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

  console.log("createContactResponse", createContactResponse);

  return {
    status: "success",
    text: "You've been added to the mailing list!",
  };
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
