import React from "react";
import { ConnectionYoutubeAccountButton } from "./ConnectYoutubeAccountButton";
import { api } from "~/trpc/server";

export default async function ManageYoutubeConnections() {
  const data = await api.user.getConnectedYoutubeAccounts();

  console.log(data);

  return (
    <div>
      <ConnectionYoutubeAccountButton />
    </div>
  );
}
