import { ErrorCode } from "react-dropzone";

export function getFileDropErrorMessage(
  fileType: "audio" | "image",
  error: ErrorCode | null,
  allowedFileSizeBytes: number,
  allowedFileExtensions: string[],
) {
  switch (error) {
    case ErrorCode.FileTooLarge:
      return `File size exceeds your plan's limit of ${(allowedFileSizeBytes / 1024 / 1024).toFixed(2)} MB`;
    case ErrorCode.FileInvalidType:
      return `Invalid file type. Please upload a ${allowedFileExtensions.join(", ")} file.`;
    case null:
      return `Something went wrong. Please ensure you are uploading a valid ${fileType} file.`;
    default:
      return "Error";
  }
}
