"use client";

import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Database } from "types_db";
import { createClient } from "~/utils/supabase/client";

// Returns realtime data about operation
type OperationLog = Database["public"]["Tables"]["operation_logs"]["Row"];

export default function useRealtimeOperationStatus(operationId: string | null) {
  const supabase = createClient();
  const [logs, setLogs] = useState<OperationLog[]>([]);

  useEffect(() => {
    // Don't subscribe to realtime if operationId is null
    if (operationId === null) {
      console.debug(
        "operationId is null in useRealtimeOperations hook, not subscribing",
      );
      return;
    }
    console.debug(
      "Subscribing to realtime operation logs with operationId",
      operationId,
    );

    const channel = supabase
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

    console.log(channel);

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, operationId]);

  // Whenever operationId changes, reset our logs
  useEffect(() => {
    setLogs([]);
  }, [operationId]);

  return logs;
}
