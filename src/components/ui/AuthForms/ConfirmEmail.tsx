// We will display this when the user should check their email for a confirmation link

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Button } from "../Button";

export default function ConfirmEmailScreen({
  email,
  onCloseConfirmEmailScreen,
}: {
  email: string;
  onCloseConfirmEmailScreen: () => void;
}) {
  return (
    <div
      className="mx-auto flex  w-full max-w-md items-center rounded-none bg-white p-4 shadow-input dark:bg-black  md:rounded-2xl md:p-8"
      style={{
        height: "calc(100vh - 1326px)",
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle> Please check your email inbox</CardTitle>
          <CardDescription>
            We{"'ve"} sent your email address{" "}
            <span className="text-foreground"> {email}</span> a link to verify
            your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => onCloseConfirmEmailScreen()}>Go back</Button>
        </CardContent>
      </Card>
    </div>
  );
}
