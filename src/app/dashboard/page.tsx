"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import OperationLogDisplay from "~/components/ui/OperationLogDisplay/OperationLogDisplay";
import useOperationData from "~/hooks/use-operation-data";
import useUserData from "~/hooks/use-user-data";
import { createClient } from "~/utils/supabase/client";

export default function Dashboard() {
  const supabase = createClient();
  const userData = useUserData();

  const [viewingOperation, setViewingOperation] = useState<string | null>(null);

  // Whenever active operation id changes, automatically change the view to that one
  useEffect(
    () => setViewingOperation(userData.data?.activeOperationId ?? null),
    [userData.data?.activeOperationId],
  );

  const { logs, status, video_title } = useOperationData(viewingOperation);

  // Query for recent operations
  const recentOperations = useQuery({
    queryKey: ["recentOperations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mt-10 flex flex-col items-center">
      <CreateVideoForm />

      <div className="mt-8">
        <h2 className=" text-start text-2xl font-bold">
          Recent Operations
        </h2>
        <div className="mb-2 grid grid-flow-col grid-rows-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-1">
          {recentOperations?.data?.map((operation) => (
            <Button
              onClick={() => setViewingOperation(operation.id)}
              key={operation.id}
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
