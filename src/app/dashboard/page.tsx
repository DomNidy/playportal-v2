"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import OperationLogDisplay from "~/components/ui/OperationLogDisplay/OperationLogDisplay";
import UserCard from "~/components/ui/UserCard/user-card";
import useAuth from "~/hooks/use-auth";
import useOperationData from "~/hooks/use-operation-data";
import useRealtimeOperationStatus from "~/hooks/use-realtime-operation-status";
import useUserData from "~/hooks/use-user-data";
import { createClient } from "~/utils/supabase/client";

export default function Dashboard() {
  const supabase = createClient();
  const auth = useAuth();

  const userData = useUserData();

  const [viewingOperation, setViewingOperation] = useState<string | null>(null);

  // Whenever active operation id changes, automatically change the view to that one
  useEffect(
    () => setViewingOperation(userData.data?.activeOperationId ?? null),
    [userData.data?.activeOperationId],
  );

  const { logs, started_at, status, video_title, s3FileKey } =
    useOperationData(viewingOperation);

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
    <div>
      <div className="flex w-full flex-row justify-between">
        <h1 className="text-4xl font-bold ">Dashboard</h1>
        <UserCard user={auth.user} userCredits={userData?.data?.credits ?? 0} />
      </div>

      <CreateVideoForm />

      <h2 className="text-2xl font-bold mt-4">Recent Operations</h2>
      <div className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col gap-2 md:grid-cols-3 lg:grid-cols-4 mb-2">
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
