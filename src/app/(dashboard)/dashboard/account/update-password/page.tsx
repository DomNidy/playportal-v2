"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { Link } from "~/components/ui/Link";
import { MoonLoader } from "react-spinners";
import { LoaderSizeProps } from "react-spinners/helpers/props";
import { Label } from "~/components/ui/Form/Label";

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
    <div className="flex w-full max-w-[500px] flex-col items-center">
      <Link variant={"button"} href={"/dashboard/account"} className="self-start mb-2">
        Go back
      </Link>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="dark flex w-full flex-shrink basis-96 flex-col gap-4 rounded-lg border-[1.8px] border-white/5 bg-card p-4"
        >
          <h2 className="text-2xl font-semibold leading-none tracking-tight">
            Update your password
          </h2>

          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Password" type="password" />
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
                  <Input
                    {...field}
                    placeholder="Confirm password"
                    type="password"
                  />
                </FormControl>
                <FormDescription>Confirm your new password.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

            <div className="flex-1"/>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full self-end place-self-end"
          >
            <SubmitStatus
              loaderProps={{
                color: "#0C0B0C",
                size: 20,
              }}
              isLoading={form.formState.isSubmitting}
              text="Update Password"
            />
          </Button>
        </form>
      </Form>
    </div>
  );
}

function SubmitStatus({
  isLoading,
  text,
  loaderProps,
}: {
  isLoading: boolean;
  text: string;
  loaderProps: LoaderSizeProps;
}) {
  return isLoading ? <MoonLoader {...loaderProps} /> : <p>{text}</p>;
}
