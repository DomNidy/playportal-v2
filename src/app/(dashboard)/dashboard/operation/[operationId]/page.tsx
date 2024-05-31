"use client";
import { Link } from "~/components/ui/Link";
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

  // const supabase = createClient();

  // const sub = supabase.realtime.channel("test").on("postgres_changes")

  const { isOperationDataLoading, videoTitle, logs, status, associatedFiles } =
    useOperationData(operationId);

  const { YouTube: youtubeUploads } = useUploadOperationsData(operationId);

  return (
    <div className="px-4">
      {!isOperationDataLoading && !videoTitle && (
        <>
          <p className="text-lg text-white">Video does not exist</p>
          <Link variant={"button"} href={"/dashboard/create-video"}>
            Create one
          </Link>
        </>
      )}

      <div className="flex w-full flex-col  space-y-2 last:mt-2 lg:max-w-[900px]">
        {status === "Completed" && (
          <Link
            variant={"button"}
            className="self-end"
            href="/dashboard/create-video"
          >
            Create another
          </Link>
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

        {!!associatedFiles && (
          <div className="flex w-full flex-col justify-evenly gap-2 sm:flex-row ">
            {associatedFiles.map((fileData) => (
              <DownloadFileButton
                s3Key={fileData.s3_key}
                key={fileData.s3_key}
                props={{ className: "w-full" }}
              >
                Download {fileData.file_type}
              </DownloadFileButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
