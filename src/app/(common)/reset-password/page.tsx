"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/Form";
import { Input } from "~/components/ui/Input";
import { Label } from "~/components/ui/Label";
import { ResetPasswordFormSchema } from "~/definitions/form-schemas";
import { createClient } from "~/utils/supabase/client";
import { getURL } from "~/utils/utils";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(true);

  const form = useForm({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (
    formData: z.infer<typeof ResetPasswordFormSchema>,
  ) => {
    const { email } = formData;
    console.log(email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getURL("/auth/reset-password"),
    });

    if (!error) {
      setStatusMessage(
        "If an account with that email exists, we sent you an email with instructions to reset your password.",
      );
      setShowForm(false);
      return;
    }

    setStatusMessage("An error occurred. Please try again or contact support.");
  };

  return (
    <div className="mt-40 flex w-full justify-center">
      {showForm ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input id="email" {...field} placeholder="Email" />
                  </FormControl>
                  <FormDescription>
                    Please enter the email address associated with your account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-4"
              disabled={form.formState.isSubmitting}
            >
              Reset password
            </Button>
          </form>
        </Form>
      ) : (
        <p>{statusMessage}</p>
      )}
    </div>
  );
}
