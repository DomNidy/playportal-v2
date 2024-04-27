"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { Input } from "../Input";
import { Button } from "../Button";
import { useState } from "react";
import { createClient } from "~/utils/supabase/client";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

export default function SignUp() {
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
  });

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    setIsSubmitting(true);
    // TODO: After the user confirms their email address, they get redirected to `localhost:3000/?code={SOME CODE HERE}`
    // TODO: We might want to do something with this code, check supabase docs
    await supabase.auth
      .signInWithPassword({
        email: data.email,
        password: data.password,
      })
      .then((res) => {
        if (res.error) {
          form.setError("email", { message: res.error.message });
        }
      });
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          Sign in
        </Button>
      </form>
    </Form>
  );
}
