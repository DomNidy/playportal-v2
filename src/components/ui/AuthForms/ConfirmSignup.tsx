"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function ConfirmSignupScreen({
  confirmationUrl,
}: {
  confirmationUrl: string;
}) {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-md rounded-none bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
      <Card>
        <CardHeader>
          <CardTitle> Let{"'"}s get started</CardTitle>
          <CardDescription>
            Thanks for signing up! To complete the process, hit the button below
            and get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(confirmationUrl)}>Continue</Button>
        </CardContent>
      </Card>
    </div>
  );
}
