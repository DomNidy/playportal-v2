import { Suspense } from "react";
import { Toaster } from "~/components/ui/Toasts/toaster";
import { TRPCReactProvider } from "~/trpc/react";
import AuthProvider from "./auth-provider";

// We will wrap our children in all of our providers here, just so we don't have to do it in layout
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </AuthProvider>
      <Suspense>
        <Toaster />
      </Suspense>
    </>
  );
}
