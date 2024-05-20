import React from "react";
import { ConnectionYoutubeAccountButton } from "./ConnectYoutubeAccountButton";
import { api } from "~/trpc/server";
import YoutubeChannelSummaryCard from "./YoutubeChannelSummaryCard";

export default async function ManageYoutubeConnections() {
  const data = await api.user.getConnectedYoutubeAccounts();

  return (
    <div>
      <div className="flex flex-col space-y-2 mb-2">
        {data.map((account) => (
          <YoutubeChannelSummaryCard
            key={account.channelId}
            accountSummary={account}
          />
        ))}
      </div>
      <ConnectionYoutubeAccountButton />
    </div>
  );
}
