"use client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "../Button";
import { toast } from "../Toasts/use-toast";

export default function ConnectionYoutubeAccountButton() {
  const router = useRouter();
  const apiUtils = api.useUtils();

  const handleConnectYoutubeAccount = async () => {
    const { authUrl } = await apiUtils.user.getYouTubeAuthorizationURL.fetch();

    if (!authUrl) {
      toast({
        title: "Error",
        description:
          "Failed to get YouTube authorization URL, please try again later or contact support.",
        variant: "destructive",
      });
      return;
    }

    router.push(authUrl);
  };

  return (
    <Button
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      onClick={handleConnectYoutubeAccount}
    >
      Connect YouTube Account
    </Button>
  );
}
