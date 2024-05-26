import {
  type RealtimeChannel,
  type RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { type Database } from "types_db";
import { createClient } from "~/utils/supabase/client";

type OperationStatus = Database["public"]["Enums"]["operation_status"];
type OperationLog = Database["public"]["Tables"]["operation_logs"]["Row"];
type Operation = Database["public"]["Tables"]["operations"]["Row"];
// The files associated with this operation
type AssociatedFileMetadata =
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

  const [videoTitle, setVideoTitle] = useState<string>();
  const [startedAt, setStartedAt] = useState<string>();
  const [associatedFiles, setAssociatedFiles] = useState<
    AssociatedFileMetadata[]
  >([]);

  // If our query for the operation data is loading (not the logs)
  const [isOperationDataLoading, setIsOperationDataLoading] =
    useState<boolean>(true);

  const [operationStatus, setOperationStatus] =
    useState<OperationStatus | null>(null);
  const [logs, setLogs] = useState<OperationLog[]>([]);

  // State to store the subscriptions we have to postgres so we can unsub when operation finishes
  const [operationsSubscription, setOperationsSubscription] = useState<
    RealtimeChannel | undefined
  >();

  const [logsSubscription, setLogsSubscription] = useState<
    RealtimeChannel | undefined
  >();

  // Whenever the operation status changes, we make sure we still need the sockets open
  // If we don't, we unsubscribe from the channels
  useEffect(() => {
    const unsubscribeFromChannels = async () => {
      // Don't unsubscribe if the operation is still ongoing
      if (operationStatus === "Ongoing") return;

      // If we have connection open reading the operations table, unsub
      if (operationsSubscription?.socket.isConnected()) {
        console.debug("Unsubscribing from operations channel");
        await operationsSubscription.unsubscribe();
        setOperationsSubscription(undefined);
      }

      // If we have connection open reading the operation_logs table, unsub
      if (logsSubscription?.socket.isConnected()) {
        console.debug("Unsubscribing from logs channel");
        await logsSubscription.unsubscribe();
        setLogsSubscription(undefined);
      }
    };

    // Unsub as the operation status changes
    void unsubscribeFromChannels();

    // Also run the unsubscribe function when the component unmounts
    return () => {
      console.debug("Component unmounting, unsubscribing from channels");
      void unsubscribeFromChannels();
    };
  }, [logsSubscription, operationStatus, operationsSubscription]);

  // We want this effect to do the following:
  // Fetch our initial operation data (if any can be found)
  // Based off that initial data, we can decide if we need to open up socket connections
  // Should only run once when the component mounts
  useEffect(() => {
    let isMounted = true;

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

    const openSocketConnection = async () => {
      console.debug("Operation is ongoing, opening socket connections");
      // If ongoing, subscribe to relevant channels
      //* We also want to fetch pre-existing logs even if operation is still ongoing (incase of refresh or something, we will combine the logs received from the channels later)
      // TODO: Add the `filter` property to only check for the relevant rows (with matching id)
      const logsChannel = supabase
        .channel("realtime operation logs")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "operation_logs",
          },
          (payload: RealtimePostgresChangesPayload<OperationLog>) => {
            const msg = payload.new as OperationLog;

            setLogs((prevLogs) => [...prevLogs, msg]);
          },
        )
        .subscribe();

      // TODO: Add the `filter` property to only check for the relevant rows (with matching id)
      // Subscribe to operation table and check for changes in the status
      const operationsChannel = supabase
        .channel("realtime operation status")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "operations",
          },
          (payload: RealtimePostgresChangesPayload<Operation>) => {
            const updatedOperation = payload.new as Operation;

            setOperationStatus(updatedOperation.status ?? "Ongoing");
          },
        )
        .subscribe();

      setLogsSubscription(logsChannel);
      setOperationsSubscription(operationsChannel);
    };

    // Fetch initial data, then open socket connections if operation is ongoing
    void fetchInitialOperationData().then((initialData) => {
      console.log("Initial data fetched", initialData);
      // Set the initial data returned from fetchInitialOperationData
      setOperationStatus(initialData?.operationStatus ?? null);
      setLogs(initialData?.logs ?? []);
      setVideoTitle(initialData?.videoTitle ?? "");
      setStartedAt(initialData?.startedAt ?? "");

      if (isMounted && initialData?.operationStatus === "Ongoing") {
        void openSocketConnection();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [operationId, supabase]);

  // Hook that fetches the associated files when the operation is completed
  useEffect(() => {
    const fetchAssociatedFiles = async () => {
      console.log("Operation is completed, fetching associated files");

      const s3Key = await supabase
        .from("file_metadata")
        .select("*")
        .eq("operation_id", operationId ?? "");

      setAssociatedFiles(s3Key.data ?? []);
    };

    if (operationStatus === "Completed") void fetchAssociatedFiles();
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
