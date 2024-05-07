"use client";
import OperationLogDisplay from "~/components/ui/OperationLogDisplay/OperationLogDisplay";
import useOperationData from "~/hooks/use-operation-data";

export default function OperationDataPage({
  params,
}: {
  params: { operationId: string };
}) {
  const operationData = useOperationData(params.operationId);

  return (
    <div>
      {!operationData.isOperationDataLoading && !operationData.video_title && (
        <p>Operation does not exist</p>
      )}
      {operationData.status && (
        <OperationLogDisplay
          operationLogs={operationData.logs}
          operationStatus={operationData.status}
          videoTitle={operationData.video_title}
        />
      )}
    </div>
  );
}
