"use client";
import { useState, useEffect } from "react";
import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import OperationLogDisplay from "~/components/ui/OperationLogDisplay/OperationLogDisplay";
import useOperationData from "~/hooks/use-operation-data";
import useUserData from "~/hooks/use-user-data";

export default function CreateVideoPage() {
  const { userData } = useUserData();

  const [viewingOperation, setViewingOperation] = useState<string | null>(null);

  useEffect(
    () => setViewingOperation(userData?.data?.activeOperationId ?? null),
    [userData?.data?.activeOperationId],
  );

  const { logs, status, video_title } = useOperationData(viewingOperation);

  return (
    <div>
      <CreateVideoForm />

      {viewingOperation && status && (
        <OperationLogDisplay
          operationLogs={logs}
          operationStatus={status}
          videoTitle={video_title}
        />
      )}
    </div>
  );
}
