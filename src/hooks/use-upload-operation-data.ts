"use client";
import { useQuery } from "@tanstack/react-query";
import type { Json, Database } from "types_db";
import { createClient } from "~/utils/supabase/client";

type UploadPlatforms = Database["public"]["Enums"]["upload_platform"];
type UploadStatus = Database["public"]["Enums"]["upload_video_status"];

export type UploadOperationsData = {
  // Whether or not we are fetching our initial data (only true when we first fetch)
  // We will group each upload operation by the platform they are being uploaded to for convenience
  [platform in UploadPlatforms]?: UploadOperationData<platform>[];
};

// Contains metadata about the account this video is to be uploaded to
// For example, things like youtube channel id, channel title, avatar url
export type UploadTargetAccount = {
  avatarUrl?: string | null;
  name?: string | null;
  // The service account id
  id: string;
};

// Data about each individual upload operation
type UploadOperationData<Platform> = {
  id: string;
  metadata: Json;
  status: UploadStatus;
  // Target account can be null if the linked account is unlinked
  targetAccount: UploadTargetAccount | null;
  platform: Platform;
};

// Takes the data returned from our upload_video_operations query and maps it to the type our hook exposes
function transformQueryToUploadOperationData<platform>(op: {
  id: string;
  create_operation_id: string;
  created_at: string | null;
  metadata: Json;
  status: UploadStatus;
  upload_platform: platform;
  oauth_creds: UploadTargetAccount | null;
}): UploadOperationData<platform> {
  return {
    ...op,
    platform: op.upload_platform,
    targetAccount: op.oauth_creds
      ? {
          avatarUrl: op.oauth_creds?.avatarUrl,
          name: op.oauth_creds?.name,
          id: op.oauth_creds.id,
        }
      : null,
  };
}

/**
 * When passed in a create video operation id, fetches all upload operations associated with it
 *
 * If any of the fetched upload operations are in progress, a websocket connection will be opened up to receive updates
 * When all of the upload operations are complete, we close the websockets
 */
export function useUploadOperationsData(
  operationId: string,
): UploadOperationsData & { isLoading: boolean } {
  const supabase = createClient();

  const uploadOperationsQuery = useQuery<UploadOperationsData>({
    queryFn: async () => {
      // Select all upload_video_operations related to the current operation
      // Also selects data pertaining to the target upload channel (service account)
      const { data: uploadOps } = await supabase
        .from("upload_video_operations")
        .select(
          `operations!inner(), 
          id, create_operation_id, created_at, metadata, status, upload_platform, 
          oauth_creds(avatarUrl:service_account_image_url, name:service_account_name, id:service_account_id)`,
        )
        .eq("operations.id", operationId);

      const uploadOperations: UploadOperationsData = {
        YouTube: uploadOps
          ?.filter((op) => op.upload_platform === "YouTube")
          .map((op) =>
            transformQueryToUploadOperationData<typeof op.upload_platform>(op),
          ),
      };

      return uploadOperations;
    },
    queryKey: [["user", "uploadOperations", operationId]],
  });

  return {
    isLoading: uploadOperationsQuery.isLoading,
    YouTube: uploadOperationsQuery.data?.YouTube,
  };
}
