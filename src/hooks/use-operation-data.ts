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

// If the operation is live, we will open up a socket connection
export default function useOperationData(operationId: string | null): {
  video_title: string;
  started_at: string;
  s3FileKey?: string;
  status: OperationStatus | null; // LoadingData is for when we are still loading data... (so we can show loading state)
  logs: OperationLog[];
  isOperationDataLoading: boolean;
} {
  const supabase = createClient();

  const [videoTitle, setVideoTitle] = useState<string>();
  const [startedAt, setStartedAt] = useState<string>();
  const [s3FileKey, setS3FileKey] = useState<string>();

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

  // Reset data when operation id changes
  useEffect(() => {
    setVideoTitle(undefined);
    setStartedAt(undefined);
    setS3FileKey(undefined);
    setOperationStatus(null);
    setLogs([]);
  }, [operationId]);

  // Whenever the operation status changes, we make sure we still need the sockets open
  // If we don't, we unsubscribe from the channels
  useEffect(() => {
    if (operationId === null) {
      console.debug("OperationId is null, not doing any data-fetching");
      return;
    }

    const unsubscribeFromChannels = async () => {
      if (operationStatus === "Ongoing") return;

      // If we have connection open reading the operations table, unsub
      if (operationsSubscription?.socket.isConnected()) {
        await operationsSubscription.unsubscribe();
        setOperationsSubscription(undefined);
      }

      // If we have connection open reading the operation_logs table, unsub
      if (logsSubscription?.socket.isConnected()) {
        await logsSubscription.unsubscribe();
        setLogsSubscription(undefined);
      }
    };

    void unsubscribeFromChannels();
  }, [logsSubscription, operationId, operationStatus, operationsSubscription]);

  // If the operation is not live, just query for all pre-existing logs & data
  // If it is live, open socket connections to read the data as it is updated in real time
  useEffect(() => {
    if (operationId === null) {
      console.debug("OperationId is null, not doing any data-fetching");
      return;
    }

    const fetchStatus = async () => {
      setIsOperationDataLoading(true);
      const operationData = await supabase
        .from("operations")
        .select("*")
        .eq("id", operationId)
        .order("created_at", { ascending: true })
        .single();

      // If operation doesn't exist, return
      if (!operationData.data) {
        console.log("operation doesnt exist");
        return;
      }

      // If not ongoing, fetch all pre-existing data and return
      if (operationData.data?.status !== "Ongoing") {
        console.debug(
          "Operation is not ongoing, fetching all pre-existing data",
          operationData.data?.status,
        );

        const logs = await supabase
          .from("operation_logs")
          .select("*")
          .eq("operation_id", operationId)
          .order("created_at", { ascending: true });

        setLogs(logs.data ?? []);
        setOperationStatus(operationData.data?.status ?? "Ongoing");
        setVideoTitle(operationData.data?.video_title);
        setStartedAt(operationData.data?.created_at);

        // If status is completed, query for the s3 key
        const s3Key = await supabase
          .from("file_metadata")
          .select("s3_key")
          .eq("operation_id", operationId)
          .single()
          .then((res) => res.data?.s3_key);

        setIsOperationDataLoading(false);
        setS3FileKey(s3Key);
        return;
      }

      console.debug("Operation is ongoing, opening socket connections");
      // If ongoing, subscribe to relevant channels

      //* We also want to fetch pre-existing logs even if operation is still ongoing (incase of refresh or something, we will combine the logs received from the channels later)
      const logs = await supabase
        .from("operation_logs")
        .select("*")
        .eq("operation_id", operationId)
        .order("created_at", { ascending: true });

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
      setLogs(logs.data ?? []);
      setOperationsSubscription(operationsChannel);
      setOperationStatus(operationData.data.status ?? "Ongoing");
      setVideoTitle(operationData.data.video_title);
      setStartedAt(operationData.data.created_at);
    };

    void fetchStatus();
  }, [operationId, supabase]);

  return {
    video_title: videoTitle ?? "",
    started_at: startedAt ?? "",
    s3FileKey,
    status: operationStatus,
    logs,
    isOperationDataLoading,
  };
}
