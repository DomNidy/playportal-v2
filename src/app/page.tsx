import { Suspense } from "react";
import Navbar, { NavbarPlaceholder } from "~/components/ui/Navbar/Navbar";

// TODO: Figure out why this isnt statically rendered
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b ">
      <Suspense fallback={<NavbarPlaceholder />}>
        <Navbar />
      </Suspense>
    </main>
  );
}
