import { CheckCircle2 } from "lucide-react";
import { type Database } from "types_db";
import OperationCardDropdown from "./OperationCardDropdown";

export default function OperationCard({
  operation,
}: {
  operation: Database["public"]["Views"]["operations_filemetadata"]["Row"];
}) {
  return (
    <div className="flex h-[6.5rem]  flex-row gap-2 rounded-2xl  border-[1px] bg-colors-background-900 px-5 py-2 pt-4">
      <CheckCircle2 className="mt-[2px]" width={16} height={16} />
      <div className="flex flex-col">
        <h1 className="align-text-top text-base  ">{operation.video_title}</h1>
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
}

export function OperationCardSkeleton() {
  return (
    <div className="flex h-[5.5rem] w-[21rem] animate-pulse flex-row gap-2 rounded-2xl  border-[1px] bg-colors-background-950 px-5 py-2 pt-4">
      <div className="flex flex-col">
        <h1 className="text-base font-medium "></h1>
        <p className="mt-[0.2rem] text-sm text-white/80"></p>
      </div>
    </div>
  );
}
