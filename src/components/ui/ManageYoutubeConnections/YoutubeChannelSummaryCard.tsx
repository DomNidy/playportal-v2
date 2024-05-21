"use client";
import { useState } from "react";
import { type YoutubeChannelSummary } from "~/utils/oauth/youtube";
import { Button } from "../Button";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { api } from "~/trpc/react";
import { toast } from "../Toasts/use-toast";
import { MoonLoader } from "react-spinners";
import { useQueryClient } from "@tanstack/react-query";

export default function YoutubeChannelSummaryCard({
  accountSummary,
}: {
  accountSummary: YoutubeChannelSummary;
}) {
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState(false);
  const unlinkYoutubeAccountMutation =
    api.user.unlinkYoutubeAccount.useMutation({
      onMutate: () => {
        setIsDeleting(true);
      },
      onSuccess: () => {
        toast({
          title: "Youtube account unlinked",
          description: "You have successfully unlinked your Youtube account",
          variant: "default",
        });

        // Remove the unlinked account from the cache immediately
        void queryClient.setQueryData(
          [["user", "getConnectedYoutubeAccounts"], { type: "query" }],
          (oldData: YoutubeChannelSummary[] | undefined) => {
            if (!oldData) {
              return [];
            }

            return oldData.filter(
              (account) => account.channelId !== accountSummary.channelId,
            );
          },
        );
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
      onSettled: () => {
        setIsDeleting(false);
        void queryClient.refetchQueries({
          queryKey: [
            ["user", "getConnectedYoutubeAccounts"],
            { type: "query" },
          ],
        });
      },
    });

  return (
    <div
      className={`flex items-center justify-between ${isDeleting ?? "opacity-50"} `}
    >
      <div className="flex items-center space-x-4 ">
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
