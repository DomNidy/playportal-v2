import { CheckCircle2 } from "lucide-react";
import { type Database } from "types_db";
import OperationCardDropdown from "./OperationCardDropdown";
import { forwardRef } from "react";
import { cn } from "~/utils/utils";

export interface OperationCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  operation: Database["public"]["Views"]["operations_filemetadata"]["Row"];
}

const OperationCard = forwardRef<HTMLDivElement, OperationCardProps>(
  ({ className, operation }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[6.5rem]   flex-row gap-2 rounded-2xl  border-[1px] bg-colors-background-950 px-5 py-2 pt-4",
          className,
        )}
      >
        <CheckCircle2 className="mt-[2px]" width={16} height={16} />
        <div className="flex flex-col">
          <h1 className="align-text-top text-base  ">
            {operation.video_title}
          </h1>
          <p className="mt-[0.2rem] text-sm text-white/80">
            Created on{" "}
            {new Date(operation?.created_at ?? "").toLocaleDateString()} @{" "}
            {new Date(operation?.created_at ?? "").toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-row gap-2">
          <OperationCardDropdown operation={operation} />
        </div>
      </div>
    );
  },
);

OperationCard.displayName = "OperationCard";
export { OperationCard };
