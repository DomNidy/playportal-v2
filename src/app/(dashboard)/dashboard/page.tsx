"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import OperationCard, {
  OperationCardSkeleton,
} from "~/components/ui/OperationCard/OperationCard";
import useUserData from "~/hooks/use-user-data";
import { createClient } from "~/utils/supabase/client";

export default function Dashboard() {
  const supabase = createClient();
  const { auth } = useUserData();

  // Whenever active operation id changes, automatically change the view to that one
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

  // Query for recent operations

  return (
    <div className="mt-10 flex flex-col items-center">
      <div className="flex w-full flex-row-reverse">
        <Link
          href={"/dashboard/create-video"}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Create Video...
        </Link>
      </div>
      <div className="mt-2 grid  grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentOperations?.data ? (
          recentOperations?.data?.map((operation) => (
            <OperationCard operation={operation} key={operation.operation_id} />
          ))
        ) : recentOperations.isLoading ? (
          <OperationCardSkeleton />
        ) : (
          <p>No videos found</p>
        )}
      </div>
    </div>
  );
}
