import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";
import { type createClient } from "./supabase/server";
import { type Database } from "types_db";
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

// Utility function to check feature flag for a user
// Pass this a supabase server client, it works on the server side
export async function getFeatureFlag(
  supabase: ReturnType<typeof createClient>,
  feature: Database["public"]["Enums"]["feature"],
  userId: string,
) {
  const { data: featureFlag } = await supabase
    .from("user_feature_flags_view")
    .select("*")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("feature_enabled", true)
    .eq("feature_enabled_for_user", true)
    .maybeSingle();

  if (featureFlag) {
    console.log(`Feature flag ${feature} is enabled for user ${userId}`);
    return true;
  }

  return false;
}

export function isSuccessStatusCode(statusCode: number) {
  return statusCode >= 200 && statusCode < 300;
}

// Utility type that asserts all properties of an object are non-nullable (not undefined or null)
export type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
