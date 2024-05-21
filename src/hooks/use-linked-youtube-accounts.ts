import { api } from "~/trpc/react";

export function useLinkedYoutubeAccounts() {
  return api.user.getConnectedYoutubeAccounts.useQuery(undefined, {});
}
