"use client";
import React, { useState } from "react";
import { Input } from "~/components/ui/Input";
import { cn } from "~/utils/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import { createClient } from "~/utils/supabase/client";
import { Button } from "../Button";
import { getURL } from "~/utils/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import Link from "next/link";
import ConfirmEmailScreen from "./ConfirmEmail";
import posthog from "posthog-js";
import { ClipLoader } from "react-spinners";
import { signUp } from "~/utils/actions";

// Type used to track the status of the signup process
type SignupStatus = {
  email?: string;
  shouldCheckEmail: boolean;
};

const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must contain at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters."),
  })
  .refine(
    (credentials) => credentials.password === credentials.confirmPassword,
    { message: "Your passwords must match", path: ["confirmPassword"] },
  );

export function SignupForm() {
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Whether or not the user should be shown the "Confirm your email" screen
  // We should set this to true when the user successfully signs up, and when only a
  // Reference to supabase docs: https://supabase.com/docs/reference/javascript/auth-signup
  // Confirm email determines if users need to confirm their email address after signing up.
  // - If Confirm email is enabled, a user is returned but session is null.
  // - If Confirm email is disabled, both a user and a session are returned.
  // So if a user is returned, but session is null, they need to confirm their email address.
  const [signupStatus, setSignupStatus] = useState<SignupStatus>({
    email: undefined,
    shouldCheckEmail: false,
  });

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof SignUpSchema>) {
    setIsSubmitting(true);
    posthog.capture("signup_with_email_form_submitted", {
      email: data.email,
    });
    const signUpResponse = await signUp(data.email, data.password);
    setIsSubmitting(false);
    if (signUpResponse && "showConfirmEmail" in signUpResponse) {
      setSignupStatus({ email: data.email, shouldCheckEmail: true });
      form.reset();
    }
  }

  if (signupStatus.shouldCheckEmail && signupStatus.email) {
    return (
      <ConfirmEmailScreen
        email={signupStatus.email}
        onCloseConfirmEmailScreen={() =>
          setSignupStatus({
            email: undefined,
            shouldCheckEmail: false,
          })
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-none bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to Playportal
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Please enter your credentials, or sign up with one of our third party
        providers.
      </p>

      <Form {...form}>
        <form className="mt-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <LabelInputContainer className="mb-4">
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="johndoe@mail.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </LabelInputContainer>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <LabelInputContainer className="mb-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </LabelInputContainer>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <LabelInputContainer className="mb-4">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      id="confirmPassword"
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </LabelInputContainer>
              </FormItem>
            )}
          />
          <Button
            disabled={isSubmitting}
            className={`group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white 
                        shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800
                         dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]`}
            type="submit"
          >
            {!isSubmitting ? (
              <>Sign up &rarr; </>
            ) : (
              <>
                <ClipLoader size={20} color={"#fff"} className="inline" />
              </>
            )}

            <BottomGradient />
          </Button>
        </form>
      </Form>

      <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

      <div className="flex flex-col space-y-4">
        <Button
          className=" group/btn relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
          onClick={async () => {
            posthog.capture("signup_with_google_button_clicked");

            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: getURL("/auth/callback"),
              },
            });
          }}
        >
          <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Sign up with Google
          </span>
          <BottomGradient />
        </Button>
        <Link href={"/sign-in"}>Sign in instead</Link>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
