"use client";
import React from "react";

import { Input } from "../Input";
import { signupToMailingList } from "~/utils/actions";
import { useFormState } from "react-dom";
import { CheckIcon } from "lucide-react";
import { Button } from "../Button";

export default function SignupToMailingListForm() {
  const [state, action, isPending] = useFormState(signupToMailingList, null);
  return (
    <form action={action} className="mt-4">
      {state?.status !== "success" && (
        <Input
          id="email"
          name="email"
          type="email"
          disabled={isPending}
          placeholder="johndoe@mail.com"
        />
      )}
      {state && (
        <p
          className={`mt-2 ${state?.status === "error" ? "text-destructive" : "text-ptl_accent-hover"}`}
        >
          {state?.status === "success" && (
            <CheckIcon className="mb-[2px] mr-2 inline" />
          )}
          {state?.text}
        </p>
      )}

      {state?.status !== "success" && (
        <Button type="submit" className="mt-2" disabled={isPending}>
          {isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      )}
    </form>
  );
}
