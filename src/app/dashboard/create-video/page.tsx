"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import OperationLogDisplay from "~/components/ui/OperationLogDisplay/OperationLogDisplay";
import useAuth from "~/hooks/use-auth";
import useOperationData from "~/hooks/use-operation-data";
import { createClient } from "~/utils/supabase/client";

export default function CreateVideoPage() {
  const supabase = createClient();
  const { userData, user } = useAuth();

  const [viewingOperation, setViewingOperation] = useState<string | null>(null);

  const recentOperations = useQuery({
    queryKey: ["recentOperations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operations_filemetadata")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("file_origin", "PlayportalBackend")
        .eq("user_id", user?.id ?? "")
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  useEffect(
    () => setViewingOperation(userData?.data?.activeOperationId ?? null),
    [userData?.data?.activeOperationId],
  );

  const { logs, status, video_title } = useOperationData(viewingOperation);

  return (
    <div>
      <CreateVideoForm />

      <div className="mt-8">
        <h2 className=" text-start text-2xl font-bold">Recent Operations</h2>
        <div className="mb-2 grid grid-flow-col grid-rows-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-1">
          {recentOperations?.data?.map((operation) => (
            <Button
              onClick={() => setViewingOperation(operation.operation_id)}
              key={operation.operation_id}
              className="flex"
            >
              {operation.video_title}
            </Button>
          ))}
        </div>
      </div>

      {viewingOperation && (
        <OperationLogDisplay
          operationLogs={logs}
          operationStatus={status}
          videoTitle={video_title}
        />
      )}
    </div>
  );
}
