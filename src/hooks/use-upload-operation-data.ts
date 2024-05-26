// useUploadOperationData receives an `operationId` (a create video operation id) as a parameter,
// then uses that to find all upload operations associated with that create video operation.

import { type Database } from "types_db";

// When do we want to open up subscriptions?: When any of the initial upload operations' status is not "completed" or "failed"

type UploadPlatforms = Database["public"]["Enums"]["upload_platform"];

// Return type of useUploadOperationData
export type UploadOperationsData = {
  // We will group each upload operation by the platform they are being uploaded to for convenience
  [key in UploadPlatforms]?: string;
};

type UploadOperationData = {
  metadata: unknown;
};
