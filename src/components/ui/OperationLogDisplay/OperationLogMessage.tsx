import { type VariantProps, cva } from "class-variance-authority";
import type { OperationLog } from "./OperationLogDisplay";
import { cn, convertOperationLogToMSG } from "~/utils/utils";
import { type OperationLogCode } from "~/definitions/db-type-aliases";
import { CheckCircle } from "lucide-react";

const operationLogVariants = cva("text-medium", {
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
      default: "h-10 px-4 py-2",
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

export interface OperationLogMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof operationLogVariants> {
  operationLog: OperationLog;
}

// TODO: We want to know the upload target accounts in props here (when applicable) so we can use the convertOperationLogToMSG function to display the correct message
// TODO: Also want to style the message based on the log type returned by convertOperationLogToMSG
export function OperationLogMessage({
  operationLog,
  className,
}: OperationLogMessageProps) {
  const msg = operationLog.message
    ? convertOperationLogToMSG(operationLog?.message as OperationLogCode)
    : undefined;

  let logVariant: "destructive" | "success" | "default" | undefined;

  if (!msg) {
    return <></>;
  }

  switch (msg.type) {
    case "error":
      logVariant = "destructive";
      break;
    case "success":
      logVariant = "success";
      break;
    default:
      logVariant = "default";
  }

  return (
    <p className={cn(operationLogVariants({ variant: logVariant, className }))}>
      {msg.type === "success" ? <CheckCircle className="mr-2 inline w-[16px] h-[16px]" /> : null}
      {msg.message}{" "}
    </p>
  );
}
