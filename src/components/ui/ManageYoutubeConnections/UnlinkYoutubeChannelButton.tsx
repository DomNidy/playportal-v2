"use client";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { api } from "~/trpc/react";
import { toast } from "../Toasts/use-toast";
import { Button } from "../Button";
import { MoonLoader } from "react-spinners";
import { type YoutubeChannelSummary } from "~/definitions/db-type-aliases";

export default function UnlinkYoutubeChannelButton({
  channelId,
}: {
  channelId: string;
}) {
  const queryClient = useQueryClient();

  const unlinkYoutubeAccountMutation =
    api.user.unlinkYoutubeAccount.useMutation({
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

            return oldData.filter((account) => account.channelId !== channelId);
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
        void queryClient.refetchQueries({
          queryKey: [
            ["user", "getConnectedYoutubeAccounts"],
            { type: "query" },
          ],
        });
      },
    });

  return (
    <Button
      className="ml-auto place-self-end self-end"
      variant={"destructive"}
      disabled={unlinkYoutubeAccountMutation.isPending}
      onClick={() =>
        unlinkYoutubeAccountMutation.mutate({
          channelId,
        })
      }
    >
      {unlinkYoutubeAccountMutation.isPending ? (
        <MoonLoader size={20} color={"#fff"} />
      ) : (
        "Unlink"
      )}
    </Button>
  );
}
