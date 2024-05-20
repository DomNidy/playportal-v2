"use client";
import React from "react";
import { type YoutubeChannelSummary } from "~/utils/oauth/youtube";
import { Button } from "../Button";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { api } from "~/trpc/react";
import { toast } from "../Toasts/use-toast";
import { MoonLoader } from "react-spinners";

export default function YoutubeChannelSummaryCard({
  accountSummary,
}: {
  accountSummary: YoutubeChannelSummary;
}) {
  const unlinkYoutubeAccountMutation =
    api.user.unlinkYoutubeAccount.useMutation({
      onSuccess: () => {
        toast({
          title: "Youtube account unlinked",
          description: "You have successfully unlinked your Youtube account",
          variant: "default",
        });
      },
    });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage
            src={accountSummary.channelAvatar ?? ""}
            alt="Channel Avatar"
          />
          <AvatarFallback>{accountSummary.channelTitle}</AvatarFallback>
        </Avatar>

        <div>
          <h3 className="text-lg font-medium">{accountSummary.channelTitle}</h3>
        </div>
      </div>
      <Button
        className="ml-auto place-self-end self-end"
        variant={"destructive"}
        disabled={unlinkYoutubeAccountMutation.isPending}
        onClick={() =>
          unlinkYoutubeAccountMutation.mutate({
            channelId: accountSummary.channelId,
          })
        }
      >
        {unlinkYoutubeAccountMutation.isPending ? (
          <MoonLoader size={20} color={"#fff"} />
        ) : (
          "Unlink"
        )}
      </Button>
    </div>
  );
}
