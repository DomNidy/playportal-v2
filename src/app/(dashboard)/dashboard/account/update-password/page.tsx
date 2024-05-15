"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { toast } from "~/components/ui/Toasts/use-toast";
import { UpdatePasswordFormSchema } from "~/definitions/form-schemas";
import { createClient } from "~/utils/supabase/client";
import { getStatusRedirect } from "~/utils/utils";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(UpdatePasswordFormSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (
    formData: z.infer<typeof UpdatePasswordFormSchema>,
  ) => {
    const { error } = await supabase.auth.updateUser({
      password: formData.password,
    });

    console.log(error);

    if (error) {
      toast({
        title: "An error occurred",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    router.push(
      getStatusRedirect(
        "/dashboard/account",
        "Password updated",
        "Your password has been updated.",
      ),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Password" />
              </FormControl>
              <FormDescription>
                The new password you want to use.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="passwordConfirmation"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Confirm password" />
              </FormControl>
              <FormDescription>Confirm your new password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Update password
        </Button>
      </form>
    </Form>
  );
}
