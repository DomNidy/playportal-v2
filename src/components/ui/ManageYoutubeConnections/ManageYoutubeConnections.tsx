"use client";
import React from "react";
import { ConnectionYoutubeAccountButton } from "./ConnectYoutubeAccountButton";
import YoutubeChannelSummaryCard from "./YoutubeChannelSummaryCard";
import { api } from "~/trpc/react";
import { Button } from "../Button";
import { useQueryClient } from "@tanstack/react-query";
import YoutubeChannelSummaryLoadingCard from "./YoutubeChannelSummaryLoadingCard";

export default function ManageYoutubeConnections() {
  const queryClient = useQueryClient();

  const { data, isLoading } = api.user.getConnectedYoutubeAccounts.useQuery(
    undefined,
    {},
  );

  return (
    <div>
      <div className="mb-2 flex flex-col space-y-2">
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
