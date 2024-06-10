import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";
import type { UploadTargetAccount } from "~/hooks/use-upload-operation-data";
import type { OperationLogCode } from "~/definitions/db-type-aliases";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility bucket to determine which bucket an item is in given an s3 key
// Returns the name of the input or output bucket
export function determineBucketNameFromS3Key(s3Key: string) {
  return s3Key.includes("inputs", 32)
    ? env.S3_INPUT_BUCKET_NAME
    : env.S3_OUTPUT_BUCKET_NAME;
}

export function parseFileExtensionFromS3Key(s3Key: string) {
  const extensionRegex = /\.([0-9a-z]+)$/i;
  const extensionMatch = s3Key.match(extensionRegex);

  if (extensionMatch) {
    console.log("Parsed file extension from s3 key", extensionMatch);
    return extensionMatch[1];
  } else {
    console.log("Couldnt match file extension from s3 key", s3Key);
    return "";
  }
}
export function toDateTime(secs: number) {
  const t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
}

export const getURL = (path = "") => {
  // Check if NEXT_PUBLIC_SITE_URL is set and non-empty. Set this to your site URL in production env.
  let url = env.NEXT_PUBLIC_SITE_URL;

  // Trim the URL and remove trailing slash if exists.
  url = url.replace(/\/+$/, "");
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Ensure path starts without a slash to avoid double slashes in the final URL.
  path = path.replace(/^\/+/, "");

  // Concatenate the URL and the path.
  return path ? `${url}/${path}` : url;
};

export enum ToastType {
  status,
  error,
}
const toastKeyMap: Record<ToastType, string[]> = {
  [ToastType.status]: ["status_name", "status_description"],
  [ToastType.error]: ["error_name", "error_description"],
};

// Returns a redirect path containing toast props
// Useful for redirecting to a page with toast props
//* We will parse these in the toaster provider component
const getToastRedirect = (
  path: string,
  toastType: ToastType,
  toastName: string,
  toastDescription = "",
  disableButton = false,
  arbitraryParams = "",
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

export const getStatusRedirect = (
  path: string,
  statusName: string,
  statusDescription = "",
  disableButton = false,
  arbitraryParams = "",
) =>
  getToastRedirect(
    path,
    ToastType.status,
    statusName,
    statusDescription,
    disableButton,
    arbitraryParams,
  );

export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription = "",
  disableButton = false,
  arbitraryParams = "",
) =>
  getToastRedirect(
    path,
    ToastType.error,
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams,
  );

export function getFileExtension(fileName: string): string | null {
  // Find the position of the last dot in the file name
  const dotIndex = fileName.lastIndexOf(".");

  // If the dotIndex is -1, there is no dot in the file name
  if (dotIndex === -1) {
    return null; // Return an empty string for files without an extension
  }
  // Return the substring starting from the position of the last dot
  return fileName.substring(dotIndex + 1);
}

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined,
) => {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }
};

export function toIsoStringOrNull(timestamp: number | null) {
  return timestamp ? toDateTime(timestamp).toISOString() : null;
}

export function isSuccessStatusCode(statusCode: number) {
  return statusCode >= 200 && statusCode < 300;
}

// Utility type that asserts all properties of an object are non-nullable (not undefined or null)
export type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// Utility Function that checks if a string ends with any of the provided suffixes
// Extensions should be prefixed with a dot, e.g. ".mp3" (if they aren't we will add it)
export function isFileExtensionInList(
  fileName: string,
  allowedFileExtensions: string[],
) {
  return allowedFileExtensions.some((extension) =>
    fileName.endsWith(extension.startsWith(".") ? extension : `.${extension}`),
  );
}

// Utility function which "promisifies" an xhr request
export async function sendRequest(
  xhr: XMLHttpRequest,
  body: ArrayBuffer,
): Promise<number> {
  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.status);
      }
    };

    xhr.onerror = () => {
      reject(new Error("Error uploading file."));
    };

    xhr.send(body);
  });
}

type OperationLogMessage = {
  message: string;
  type: "info" | "error" | "success";
};

/**
 * When provided with a log code, returns the associated message to show to the user
 * @param {any} logCode:OperationLogCode - The log code to convert to a message
 * @param {any} uploadTargetAccount?:UploadTargetAccount - If provided, the target account for the upload operation, used to display more context in specific messages
 * @returns {any}
 */
export function convertOperationLogToMSG(
  logCode: OperationLogCode,
  uploadTargetAccount?: UploadTargetAccount & { platform: string },
): OperationLogMessage | undefined {
  switch (logCode) {
    case "cv_unexpected_error":
      return {
        message: `An unexpected error occured while trying to create the video. Please try again, we will issue a quota refund shortly.`,
        type: "error",
      };
    case "cv_dl_input_success":
      return {
        message: "Received your uploaded files.",
        type: "success",
      };
    case "cv_dl_input_fail":
      return {
        message:
          "Failed to retrieve your uploaded files. Please try again, we will issue a quota refund shortly.",
        type: "error",
      };
    case "cv_render_success":
      return {
        message: "Successfully created video.",
        type: "success",
      };
    case "cv_render_fail":
      return {
        message:
          "Failed to create video. Please try again, we will issue a quota refund shortly.",
        type: "error",
      };
    case "cv_output_to_s3_success":
      return {
        message: "You can now download your video.",
        type: "success",
      };
    case "cv_output_to_s3_fail":
      return {
        message:
          "Failed to make video available for download. Please try again, we will issue a quota refund shortly.",
        type: "error",
      };
    case "uv_auth_success":
      const accountName = uploadTargetAccount?.name ?? null;
      let message;

      if (accountName) {
        message = `Successfully your authenticated ${uploadTargetAccount?.platform} account '${accountName}'.`;
      } else {
        message = `Successfully authenticated your ${uploadTargetAccount?.platform} account.`;
      }

      return {
        message,
        type: "success",
      };
    case "uv_auth_fail":
      const accountNameFail = uploadTargetAccount?.name ?? null;
      let messageFail;

      if (accountNameFail) {
        messageFail = `Failed to authenticate your ${uploadTargetAccount?.platform} account '${accountNameFail}'. Please re-link your account and try again, if this issue persists please contact support.`;
      } else {
        messageFail = `Failed to authenticate your ${uploadTargetAccount?.platform} account. Please re-link your account and try again, if this issue persists please contact support.`;
      }
      return {
        message: messageFail,
        type: "error",
      };
    case "uv_unexpected_error":
      const accountNameUnexpected = uploadTargetAccount?.name ?? null;
      let messageUnexpected;

      if (accountNameUnexpected) {
        messageUnexpected = `An unexpected error occured while trying to upload video to your ${uploadTargetAccount?.platform} account '${accountNameUnexpected}'. Please try again, we will issue a quota refund shortly.`;
      } else {
        messageUnexpected = `An unexpected error occured while trying to upload the video to your ${uploadTargetAccount?.platform} account. Please try again, we will issue a quota refund shortly.`;
      }

      return {
        message: messageUnexpected,
        type: "error",
      };
    case "uv_dl_input_success":
      return {
        message: "Received the video file.",
        type: "success",
      };
    case "uv_dl_input_fail":
      return {
        message:
          "Failed to retrieve the video file. Please try again, we will issue a quota refund shortly.",
        type: "error",
      };
    case "uv_upload_success":
      const accountNameUpload = uploadTargetAccount?.name ?? null;
      let messageUpload;
      if (accountNameUpload) {
        messageUpload = `Successfully uploaded the video to your ${uploadTargetAccount?.platform} account '${accountNameUpload}'.`;
      } else {
        messageUpload = `Successfully uploaded the video to your ${uploadTargetAccount?.platform} account.`;
      }

      return {
        message: messageUpload,
        type: "success",
      };
    case "uv_upload_fail":
      const accountNameUploadFail = uploadTargetAccount?.name ?? null;
      let messageUploadFail;
      if (accountNameUploadFail) {
        messageUploadFail = `Failed to upload the video to your ${uploadTargetAccount?.platform} account '${accountNameUploadFail}'. Please try again, we will issue a quota refund shortly.`;
      } else {
        messageUploadFail = `Failed to upload the video to your ${uploadTargetAccount?.platform} account. Please try again, we will issue a quota refund shortly.`;
      }

      return {
        message: messageUploadFail,
        type: "error",
      };
  }

  return undefined;
}
