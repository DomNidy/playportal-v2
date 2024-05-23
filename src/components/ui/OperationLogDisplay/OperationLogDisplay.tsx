"use client";

import { type Database } from "types_db";
import { OperationLogMessage } from "./OperationLogMessage";
import { Card, CardContent, CardHeader, CardTitle } from "../card";

export type OperationLog =
  Database["public"]["Tables"]["operation_logs"]["Row"];

export default function OperationLogDisplay({
  operationStatus,
  videoTitle,
  operationLogs,
}: {
  operationLogs: OperationLog[];
  operationStatus: Database["public"]["Enums"]["operation_status"];
  videoTitle: string;
}) {
  return (
    <Card className="dark">
      <CardHeader>
        <CardTitle>
          {operationStatus === "Ongoing"
            ? "Creating your video"
            : operationStatus === "Failed"
              ? "Something went wrong..."
              : "Video created!"}
        </CardTitle>
      </CardHeader>

      <CardContent>
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
