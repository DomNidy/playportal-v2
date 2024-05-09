import { env } from "~/env";

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
