import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "~/utils/utils";
import { CheckCircle } from "lucide-react";
import { type TimelineEvent } from "~/hooks/use-timeline";

const operationLogVariants = cva("text-medium", {
  variants: {
    variant: {
      pending: "text-muted-foreground underline",
      error: "text-red-500 ",
      success: "text-green-500",
      cancelled: "line-through text-muted-foreground/80 strikethrough",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-foreground hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "pending",
    size: "default",
  },
});

export interface OperationLogMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof operationLogVariants> {
  operationLog: TimelineEvent;
}

export function OperationLogMessage({
  operationLog,
  className,
}: OperationLogMessageProps) {
  let logVariant: "pending" | "error" | "success" | "cancelled" | undefined;

  switch (operationLog.state) {
    case "error":
      logVariant = "error";
      break;
    case "success":
      logVariant = "success";
      break;
    case "cancelled":
      logVariant = "cancelled";
      break;
    case "pending":
      logVariant = "pending";
  }

  return (
    <p className={cn(operationLogVariants({ variant: logVariant, className }))}>
      {/* {operationLog.state === "success" ? (
        <CheckCircle className="mr-2 inline h-[16px] w-[16px]" />
      ) : null} */}
      {operationLog.state} - {operationLog.displayMessage}{" "}
    </p>
  );
}
