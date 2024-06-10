import { type UseTimelineProps } from "~/hooks/use-timeline/types";
import { type OperationLogCode } from "./db-type-aliases";

// This is the default expected timeline for a create video operation
export const CreateVideoTimelineDefaultProps: UseTimelineProps<OperationLogCode> =
  {
    expectedTimeline: [
      {
        errorCode: "cv_dl_input_fail",
        successCode: "cv_dl_input_success",
        errorDisplayMessage:
          "There was a problem loading your files. Please try again.",
        pendingDisplayMessage: "Receiving your files...",
        successDisplayMessage: "Your files have been received!",
      },
      {
        errorCode: "cv_render_fail",
        successCode: "cv_render_success",
        errorDisplayMessage:
          "Something went wrong while rendering your video. Please try again.",
        pendingDisplayMessage: "Rendering your video...",
        successDisplayMessage: "Your video has been rendered successfully!",
      },
      {
        errorCode: "cv_output_to_s3_fail",
        successCode: "cv_output_to_s3_success",
        errorDisplayMessage:
          "We couldn't create a download link for your video. Please try again.",
        pendingDisplayMessage: "Creating video download link...",
        successDisplayMessage: "You can now download your video!",
      },
    ],
    errorOnlyEvents: [
      {
        errorCode: "cv_unexpected_error",
        errorDisplayMessage:
          "An unexpected error occured while creating your video.",
      },
    ],
  };
