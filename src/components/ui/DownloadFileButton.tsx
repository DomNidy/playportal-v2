import { api } from "~/trpc/react";
import { Button } from "./Button";
import { toast } from "./Toasts/use-toast";
import React from "react";

export function DownloadFileButton({
  s3Key,
  children,
  ...props
}: {
  s3Key: string;
  props: React.ButtonHTMLAttributes<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  const presignedUrlQuery = api.user.getPresignedUrlForFile.useQuery(
    {
      s3Key: s3Key,
    },
    {
      enabled: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  return (
    <Button
      {...props.props}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onClick={async () => {
        const downloadUrl = await presignedUrlQuery.refetch();
        if (!downloadUrl.data) {
          toast({
            title: "Error",
            description: "Failed to get download url, please try again.",
            variant: "destructive",
          });
          return;
        }
        window.open(downloadUrl.data, "_blank");
      }}
    >
      {children}
    </Button>
  );
}
