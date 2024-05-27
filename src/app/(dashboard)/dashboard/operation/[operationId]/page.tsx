"use client";
import Link from "next/link";
import { DownloadFileButton } from "~/components/ui/DownloadFileButton";
import OperationLogDisplay from "~/components/ui/OperationLogDisplay/OperationLogDisplay";
import useOperationData from "~/hooks/use-operation-data";
import { useUploadOperationsData } from "~/hooks/use-upload-operation-data";

export default function OperationDataPage({
  params,
}: {
  params: { operationId: string };
}) {
  const { operationId } = params;

  const { isOperationDataLoading, videoTitle, logs, status, associatedFiles } =
    useOperationData(operationId);

  const { YouTube: youtubeUploads } = useUploadOperationsData(operationId);

  return (
    <div>
      {!isOperationDataLoading && !videoTitle && (
        <>
          <p className="text-lg text-white">Video does not exist</p>
          <Link
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            href={"/dashboard/create-video"}
          >
            Create one
          </Link>
        </>
      )}
      {status && (
        <OperationLogDisplay
          operationLogs={logs}
          operationStatus={status}
          videoTitle={videoTitle}
        />
      )}

      {youtubeUploads?.map((upload) => (
        <p key={upload.id}>
          {upload.id} - {upload.status} - {JSON.stringify(upload.metadata)}
          {upload.targetAccount?.name} - {upload?.targetAccount?.id}
        </p>
      ))}

      {!!associatedFiles &&
        associatedFiles.map((fileData) => (
          <DownloadFileButton s3Key={fileData.s3_key} key={fileData.s3_key}>
            Download {fileData.file_type}
          </DownloadFileButton>
        ))}
    </div>
  );
}
