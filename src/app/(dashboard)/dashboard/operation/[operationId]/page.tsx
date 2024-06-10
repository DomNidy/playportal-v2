"use client";
import { Link } from "~/components/ui/Link";
import { DownloadFileButton } from "~/components/ui/DownloadFileButton";
import OperationLogDisplay from "~/components/ui/OperationLogDisplay/OperationLogDisplay";
import useOperationData from "~/hooks/use-operation-data";
import { useUploadOperationsData } from "~/hooks/use-upload-operation-data";
import useTimeline from "~/hooks/use-timeline";
import { type OperationLogCode } from "~/definitions/db-type-aliases";
import { useEffect, useMemo } from "react";
import { type UseTimelineProps } from "~/hooks/use-timeline/types";

export default function OperationDataPage({
  params,
}: {
  params: { operationId: string };
}) {
  const { operationId } = params;

  const { isOperationDataLoading, videoTitle, logs, status, associatedFiles } =
    useOperationData(operationId);

  const tlProps = useMemo(() => {
    return {
      expectedTimeline: [
        {
          errorCode: "cv_dl_input_fail",
          successCode: "cv_dl_input_success",
          errorDisplayMessage: "Failed to download input.",
          pendingDisplayMessage: "Downloading your files...",
          successDisplayMessage: "Successfully downloaded your files!",
        },
        {
          errorCode: "cv_render_fail",
          successCode: "cv_render_success",
          errorDisplayMessage: "Failed to render your video.",
          pendingDisplayMessage: "Rendering your video...",
          successDisplayMessage: "Successfully rendered your video!",
        },
        {
          errorCode: "cv_output_to_s3_fail",
          successCode: "cv_output_to_s3_success",
          errorDisplayMessage: "Failed create download link for video.",
          pendingDisplayMessage: "Creating video download link...",
          successDisplayMessage: "Successfully created video download link!",
        },
      ],
      errorOnlyEvents: [
        {
          errorCode: "cv_unexpected_error",
          errorDisplayMessage:
            "An unexpected error occured while creating your video.",
        },
      ],
    } as UseTimelineProps<OperationLogCode>;
  }, []);

  const { timeline, updateWithEventArray } =
    useTimeline<OperationLogCode>(tlProps);

  useEffect(() => {
    const eventIDS = logs.map((log) => log.message);
    updateWithEventArray([
      "cv_dl_input_success",
      "cv_render_fail",
      "cv_output_to_s3_success",
    ]);
  }, [updateWithEventArray, logs]);

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
            operationLogs={timeline}
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
