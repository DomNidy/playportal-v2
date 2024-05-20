import React from "react";
import { api } from "~/trpc/react";
import { Button } from "../Button";
import { useRouter } from "next/navigation";
import { toast } from "../Toasts/use-toast";
import Cookies from "js-cookie";

export default function ManageYoutubeConnections() {
  
  return (
    <Button
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      Connect YouTube Account
    </Button>
  );
}


