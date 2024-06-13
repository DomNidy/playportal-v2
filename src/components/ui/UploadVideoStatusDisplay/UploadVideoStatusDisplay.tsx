import React from "react";
import { type UploadOperationData } from "~/hooks/use-upload-operation-data";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { cva } from "class-variance-authority";
import { cn } from "~/utils/utils";
import { CheckCircle } from "lucide-react";

const uploadVideoStatusVariants = cva("text-medium", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      destructive: "text-destructive-foreground hover:bg-destructive/90",
      success: "text-green-500",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-foreground hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "h-8 ",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export default function UploadVideoStatusDisplay({
  youtubeUploadOperationData,
}: {
  youtubeUploadOperationData: UploadOperationData<"YouTube">;
}) {
  let statusMessage;

  switch (youtubeUploadOperationData.status) {
    case "Uploading":
      statusMessage = youtubeUploadOperationData.targetAccount?.name
        ? `Uploading your video to "${youtubeUploadOperationData.targetAccount?.name}"...`
        : "Uploading your video...";
      break;
    case "Failed":
      statusMessage = "Something went wrong...";
      break;
    case "Completed":
      statusMessage = "Video created!";
      break;
    case "Pending":
      statusMessage = "Creating your video first...";
  }

  let statusVariant: "destructive" | "success" | "default" | undefined;

  switch (youtubeUploadOperationData.status) {
    case "Failed":
      statusVariant = "destructive";
      break;
    case "Completed":
      statusVariant = "success";
      break;
    default:
      statusVariant = "default";
  }

  return (
    <Card className="dark">
      <CardHeader className="p-4 pb-0">
        <CardTitle>
          {youtubeUploadOperationData.status} upload to YouTube Channel
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-2">
        <p
          className={cn(
            uploadVideoStatusVariants({ variant: statusVariant }),
            "text-muted-foreground",
          )}
        >
          Target channel: {youtubeUploadOperationData.targetAccount?.name}
        </p>

        <p
          className={cn(uploadVideoStatusVariants({ variant: statusVariant }))}
        >
          {youtubeUploadOperationData.status === "Completed" ? (
            <CheckCircle className="mr-2 inline h-[16px] w-[16px]" />
          ) : null}
          {statusMessage}
        </p>
      </CardContent>
    </Card>
  );
}
