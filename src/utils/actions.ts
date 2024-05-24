"use server";

import posthog from "posthog-js";
import { Resend } from "resend";
import { env } from "~/env";

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
