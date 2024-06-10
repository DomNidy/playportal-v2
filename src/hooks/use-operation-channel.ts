// This context should provide the realtime subscriptions for operations page
"use client";
import {
  type RealtimePostgresUpdatePayload,
  type RealtimeChannel,
  type RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { type Database } from "types_db";
import { type OperationStatus } from "~/definitions/db-type-aliases";
import { createClient } from "~/utils/supabase/client";

type OperationLog = Database["public"]["Tables"]["operation_logs"]["Row"];
type Operation = Database["public"]["Tables"]["operations"]["Row"];

export type UseOperationChannelProps = {
  // The operation we should subscribe to changes for
  operationId: string;
  // Callback executed when a new operation log is created
  setOperationLogs: Dispatch<SetStateAction<OperationLog[]>>;
  // Callback executed when operation record is updated
  setOperationStatus: Dispatch<SetStateAction<OperationStatus | null>>;
};

export function useOperationChannel({ ...props }: UseOperationChannelProps) {
  const { setOperationLogs, setOperationStatus, operationId } = props;

  // Manage the channel subscription here
  const supabase = createClient();
  const [operationChannel, setOperationChannel] =
    useState<RealtimeChannel | null>(null);

  // This subscribes to the operation channel on mount / props change
  useEffect(() => {
    console.log("Initial effect ran");

    const operationChannelSub = supabase
      .channel(`op-${operationId}`)
      .on("broadcast", { event: "*" }, (payload) => console.log(payload))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "operation_logs",
        },
        (payload: RealtimePostgresInsertPayload<OperationLog>) => {
          console.log("Received operation logs", payload);
          setOperationLogs((prev) => [...prev, payload.new]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "operations",
        },
        (payload: RealtimePostgresUpdatePayload<Operation>) => {
          console.log("Received updated operation", payload);
          if (payload.new.status) setOperationStatus(payload.new.status);
        },
      )
      .subscribe();

    setOperationChannel(operationChannelSub);

    return () => {
      void supabase.removeChannel(operationChannelSub);
    };
  }, [setOperationStatus, setOperationLogs, operationId, supabase]);

  return {
    unsubscribeChannel: async () => {
      if (operationChannel) {
        console.log("Unsubbing from op channel");
        const res = await operationChannel.unsubscribe();
        console.log("Unsub res", res);
      } else {
        console.log("Nothing to unsub from");
      }
    },
  };
}
