"use client";
import React from "react";
import ConnectionYoutubeAccountButton from "./ConnectYoutubeAccountButton";
import YoutubeChannelSummaryCard from "./YoutubeChannelSummaryCard";
import { Button } from "../Button";
import { useQueryClient } from "@tanstack/react-query";
import YoutubeChannelSummaryLoadingCard from "./YoutubeChannelSummaryLoadingCard";
import { useLinkedYoutubeAccounts } from "~/hooks/use-linked-youtube-accounts";

export default function ManageYoutubeConnections() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useLinkedYoutubeAccounts();

  return (
    <div className="flex flex-col items-center  gap-2">
      <div className="mb-2 flex w-full flex-col space-y-2 ">
        {!isLoading
          ? data?.map((account) => (
              <YoutubeChannelSummaryCard
                key={account.channelId}
                accountSummary={account}
              />
            ))
          : Array.from({ length: 1 }).map((_, index) => (
              <YoutubeChannelSummaryLoadingCard key={index} />
            ))}
      </div>

      <Button
        className="w-full"
        onClick={() =>
          void queryClient.refetchQueries({
            queryKey: [
              ["user", "getConnectedYoutubeAccounts"],
              { type: "query" },
            ],
          })
        }
      >
        Refresh accounts
      </Button>
      <ConnectionYoutubeAccountButton />
    </div>
  );
}
