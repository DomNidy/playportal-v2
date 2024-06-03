import { type VariantProps, cva } from "class-variance-authority";
import type { OperationLog } from "./OperationLogDisplay";
import { cn, convertOperationLogToMSG } from "~/utils/utils";
import { Database } from "types_db";

const operationLogVariants = cva("text-medium", {
  variants: {
    variant: {
      default: "bg-primary text-black hover:bg-primary/90 ",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
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
  variant,
  className,
}: OperationLogMessageProps) {
  const msg = operationLog.message
    ? convertOperationLogToMSG(
        operationLog?.message as Database["public"]["Enums"]["operation_logs_enum"],
      )
    : { message: "" };

  return (
    <p className={cn(operationLogVariants({ variant, className }))}>
      {msg.message}
    </p>
  );
}
