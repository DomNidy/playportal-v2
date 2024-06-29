import { toast } from "~/components/ui/Toasts/use-toast";
import { api } from "~/trpc/react";

export function useGenerateTags() {
  return api.tags.generateTags.useMutation({
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
      });
    },
  });
}
