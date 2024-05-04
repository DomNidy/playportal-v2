import { type Database } from "types_db";
import Typography from "../Typography";

type OperationLog = Database["public"]["Tables"]["operation_logs"]["Row"];

function OperationLogMessage({ operationLog }: { operationLog: OperationLog }) {
  return (
    <div>
      {operationLog.created_at} - {operationLog.message}
    </div>
  );
}

export default function OperationLogDisplay({
  operationStatus,
  videoTitle,
  operationLogs,
}: {
  operationLogs: OperationLog[];
  operationStatus:
    | Database["public"]["Enums"]["operation_status"]
    | "LoadingData";
  videoTitle: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-md border-2 p-2 ${operationStatus === "LoadingData" ? "h-[150px] animate-pulse bg-[#0A0A0A]" : ""}`}
    >
      {operationStatus === "LoadingData" ? (
        <></>
      ) : (
        <>
          <Typography variant={"h3"}>
            <span
              className={`mr-2 w-fit rounded-lg px-2 py-1 text-sm font-semibold  uppercase ${operationStatus === "Ongoing" ? "bg-yellow-200 text-yellow-600" : operationStatus === "Completed" ? "bg-green-400 text-green-800" : "bg-red-400 text-red-800"}`}
            >
              {operationStatus}
            </span>
            {videoTitle}{" "}
          </Typography>

          {operationLogs.map((operationLog) => (
            <OperationLogMessage
              key={operationLog.id}
              operationLog={operationLog}
            />
          ))}
        </>
      )}
    </div>
  );
}
