"use client";

import { useQuery } from "@tanstack/react-query";
import useUserData from "~/hooks/use-user-data";
import { createClient } from "~/utils/supabase/client";
import {
  OperationCard,
  OperationCardDummy,
  OperationCardSkeleton,
} from "../OperationCard";

export default function RecentOperationsDisplay() {
  const supabase = createClient();
  const { auth } = useUserData();

  const recentOperations = useQuery({
    queryKey: ["recentOperations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operations_filemetadata")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("file_origin", "PlayportalBackend")
        .eq("user_id", auth.user?.id ?? "")
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mt-2 grid  grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recentOperations?.data?.length && recentOperations.data.length > 0 ? (
        recentOperations?.data?.map((operation) => (
          <OperationCard operation={operation} key={operation.operation_id} />
        ))
      ) : recentOperations.isLoading ? (
        <OperationCardSkeleton />
      ) : (
        <OperationCardDummy />
      )}
    </div>
  );
}
