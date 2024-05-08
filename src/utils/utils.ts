import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";
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
