"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "~/components/ui/Toasts/toast";
import { useToast } from "~/components/ui/Toasts/use-toast";

export function Toaster() {
  const { toast, toasts } = useToast();

  //* Parse out toast data from search params if they exist
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get("status_name");
    const status_description = searchParams.get("status_description");
    const error = searchParams.get("error_name");
    const error_description = searchParams.get("error_description");

    // If error or status is set, show toast
    if (!!error || !!status) {
      toast({
        title: error ? "Something went wrong..." : status ?? "Alright!",
        description: error ? error_description : status_description,
        variant: error ? "destructive" : "default",
      });
    }

    // Clear any 'error', 'status', 'status_description', and 'error_description' search params
    // so that the toast doesn't show up again on refresh, but leave any other search params
    // intact.
    const newSearchParams = new URLSearchParams(searchParams.toString());
    const paramsToRemove = [
      "error_name",
      "status_name",
      "status_description",
      "error_description",
    ];
    paramsToRemove.forEach((param) => newSearchParams.delete(param));
    const redirectPath = `${pathName}?${newSearchParams.toString()}`;
    router.replace(redirectPath, { scroll: false });
  }, [pathName, router, searchParams, toast]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
