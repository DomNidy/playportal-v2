"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { Input } from "../Input";
import { Button } from "../Button";
import { useState } from "react";
import { createClient } from "~/utils/supabase/client";
import { getURL } from "~/utils/utils";
import { Link } from "~/components/ui/Link";
import { cn } from "~/utils/utils";
import { login } from "~/server/actions";
import { ClipLoader } from "react-spinners";
import GoogleIcon from "~/components/icons/GoogleIcon";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

export default function SigninForm() {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    setIsSubmitting(true);
    await login(data.email, data.password);
    setIsSubmitting(false);
  }

  return (
    <div className=" mx-auto w-fit max-w-md rounded-xl border-[1.8px] p-4  shadow-input md:p-8 ">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to Playportal
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Please enter your credentials, or sign in with one of our third party
        providers.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <LabelInputContainer className="mb-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                      autoComplete="email"
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
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </LabelInputContainer>
              </FormItem>
            )}
          />

          <Button
            disabled={isSubmitting}
            className={` group/btn relative mt-4 block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white 
                        shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800
                         dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]`}
            type="submit"
          >
            {!isSubmitting ? (
              <>Sign in &rarr; </>
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
          onClick={async () =>
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: getURL("/auth/callback"),
              },
            })
          }
        >
          <GoogleIcon width={20} height={20} className="mr-1" />

          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Sign in with Google
          </span>
          <BottomGradient />
        </Button>
        <div className="flex justify-between">
          <Link variant={"mutedFg"} href={"/sign-up"}>
            Sign up instead
          </Link>

          <Link variant={"mutedFg"} href={"/reset-password"}>
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="via-landing_cta-def absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
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
