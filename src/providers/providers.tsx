"use client";
import { Suspense } from "react";
import { Toaster } from "~/components/ui/Toasts/toaster";
import { TRPCReactProvider } from "~/trpc/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { env } from "~/env";

// Wouldn't this be unnecessary if we're already using a client component?
if (typeof window !== "undefined") {
  console.log(env.NEXT_PUBLIC_POSTHOG_HOST, env.NEXT_PUBLIC_POSTHOG_KEY);

  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

// We will wrap our children in all of our providers here, just so we don't have to do it in layout
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PostHogProvider client={posthog}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Suspense>
          <Toaster />
        </Suspense>
      </PostHogProvider>
    </>
  );
}
