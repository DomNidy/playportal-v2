import type { OperationLog } from "./OperationLogDisplay";

export function OperationLogMessage({
  operationLog,
}: {
  operationLog: OperationLog;
}) {
  return (
    <div>
      {operationLog.created_at} - {operationLog.message}
    </div>
  );
}
