"use client";

import { OperationLogMessage } from "./OperationLogMessage";
import { Card, CardContent, CardHeader, CardTitle } from "../Card/Card";
import { type OperationStatus } from "~/definitions/db-type-aliases";
import { type TimelineEvent } from "~/hooks/use-timeline";

export default function OperationLogDisplay({
  operationStatus,
  videoTitle,
  operationLogs,
}: {
  operationLogs: TimelineEvent[];
  operationStatus: OperationStatus;
  videoTitle: string;
}) {
  return (
    <Card className="dark">
      <CardHeader className="p-4 pb-0">
        <CardTitle>
          {operationStatus === "Ongoing"
            ? `Creating your video "${videoTitle}`
            : operationStatus === "Failed"
              ? "Something went wrong..."
              : "Video created!"}
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-0 p-4">
        {operationLogs.map((operationLog, idx) => (
          <OperationLogMessage key={idx} operationLog={operationLog} />
        ))}
      </CardContent>
    </Card>
  );
}
