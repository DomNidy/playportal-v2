"use client";

import { type Database } from "types_db";
import { OperationLogMessage } from "./OperationLogMessage";
import { Card, CardContent, CardHeader, CardTitle } from "../Card/Card";
import { type OperationStatus } from "~/definitions/db-type-aliases";

export type OperationLog =
  Database["public"]["Tables"]["operation_logs"]["Row"];

export default function OperationLogDisplay({
  operationStatus,
  videoTitle,
  operationLogs,
}: {
  operationLogs: OperationLog[];
  operationStatus: OperationStatus;
  videoTitle: string;
}) {
  return (
    <Card className="dark">
      <CardHeader className="p-4 pb-0">
        <CardTitle>
          {operationStatus === "Ongoing"
            ? `Creating your video "${videoTitle}"...`
            : operationStatus === "Failed"
              ? "Something went wrong..."
              : "Video created!"}
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-0 p-4">
        {operationLogs.length === 0 && <p className="text-muted-foreground">Loading...</p>}

        {operationLogs.map((operationLog) => (
          <OperationLogMessage
            key={operationLog.id}
            operationLog={operationLog}
          />
        ))}
      </CardContent>
    </Card>
  );
}
