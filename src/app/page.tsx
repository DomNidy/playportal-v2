"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b ">
      <div className="container flex flex-row items-start justify-center   px-4 py-8">
        <h1 className="mr-auto gap-1 text-2xl font-bold tracking-tighter sm:text-[2rem]">
          Playportal
        </h1>
        <Link
          href={"/sign-up"}
          className="rounded-lg bg-primary px-4 py-2 font-medium tracking-tight text-white hover:bg-primary/90 "
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
