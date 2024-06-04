import { useEffect, useState } from "react";
import { type Database } from "types_db";
import { createClient } from "~/utils/supabase/client";
import { useOperationChannel } from "./use-operation-channel";
import { type OperationStatus } from "~/definitions/db-type-aliases";

// We are allowing for null here, we init this state as null while data is loading

export type OperationLog =
  Database["public"]["Tables"]["operation_logs"]["Row"];
export type Operation = Database["public"]["Tables"]["operations"]["Row"];
// The files associated with this operation
export type AssociatedFileMetadata =
  Database["public"]["Tables"]["file_metadata"]["Row"];

// If the operation is live, we will open up a socket connection
export default function useOperationData(operationId: string | null): {
  videoTitle: string;
  startedAt: string;
  associatedFiles?: AssociatedFileMetadata[];
  status: OperationStatus | null; // LoadingData is for when we are still loading data... (so we can show loading state)
  logs: OperationLog[];
  isOperationDataLoading: boolean;
} {
  const supabase = createClient();

  // Operation data
  const [videoTitle, setVideoTitle] = useState<string>();
  const [startedAt, setStartedAt] = useState<string>();
  const [associatedFiles, setAssociatedFiles] = useState<
    AssociatedFileMetadata[]
  >([]);
  // If our query for the operation data is loading (not the logs)
  const [isOperationDataLoading, setIsOperationDataLoading] =
    useState<boolean>(true);

  // We will initialize our operation status as null
  const [operationStatus, setOperationStatus] =
    useState<OperationStatus | null>(null);
  const [logs, setLogs] = useState<OperationLog[]>([]);

  // Subscribe to a realtime channel & listen for updates on this operations logs & status
  // *Note: This hook is what actually listens for realtime data, it returns a function which
  // * we can invoke to unsubscribe from realtime
  const realtimeChannel = useOperationChannel({
    setOperationLogs: setLogs,
    setOperationStatus: setOperationStatus,
    operationId: operationId ?? "",
  });

  // When operation status is changed to completed, unsub
  useEffect(() => {
    if (operationStatus === "Completed") {
      void realtimeChannel.unsubscribeChannel();
    }
  }, [operationStatus, realtimeChannel]);

  // We want this effect to do the following:
  // Fetch our initial operation data (if any can be found)
  // Based off that initial data, we can decide if we need to open up socket connections
  // Should only run once when the component mounts
  useEffect(() => {
    if (operationId === null) {
      console.debug("OperationId is null, not doing any data-fetching");

      return;
    }

    const fetchInitialOperationData = async () => {
      setIsOperationDataLoading(true);
      const operationData = await supabase
        .from("operations")
        .select("*")
        .eq("id", operationId)
        .single();

      // If operation doesn't exist, return
      if (!operationData.data) {
        console.log("operation doesnt exist");
        setIsOperationDataLoading(false);
        return;
      }

      // Fetch all pre-existing data and return
      console.debug(
        "Fetching all pre-existing data",
        operationData.data?.status,
      );

      const logs = await supabase
        .from("operation_logs")
        .select("*")
        .eq("operation_id", operationId)
        .order("created_at", { ascending: true });

      // If status is completed, query for the s3 key
      setIsOperationDataLoading(false);
      return {
        logs: logs.data ?? [],
        operationStatus: operationData.data?.status ?? null,
        videoTitle: operationData.data?.video_title,
        startedAt: operationData.data?.created_at,
      };
    };

    // Fetch initial data, then open socket connections if operation is ongoing
    void fetchInitialOperationData().then((initialData) => {
      console.log("Initial data fetched", initialData);
      // Set the initial data returned from fetchInitialOperationData
      setOperationStatus(initialData?.operationStatus ?? null);
      setLogs(initialData?.logs ?? []);
      setVideoTitle(initialData?.videoTitle ?? "");
      setStartedAt(initialData?.startedAt ?? "");
    });
  }, [operationId, supabase]);

  // Hook that fetches the associated files when the operation is deemed completed, and unsubs from realtime
  useEffect(() => {
    const fetchAssociatedFiles = async () => {
      console.log("Operation is completed, fetching associated files");
      const s3Key = await supabase
        .from("file_metadata")
        .select("*")
        .eq("operation_id", operationId ?? "");

      setAssociatedFiles(s3Key.data ?? []);
    };

    if (operationStatus === "Completed") {
      void fetchAssociatedFiles();
    }
  }, [operationId, operationStatus, supabase]);

  return {
    videoTitle: videoTitle ?? "",
    startedAt: startedAt ?? "",
    associatedFiles,
    status: operationStatus,
    logs,
    isOperationDataLoading,
  };
}
