"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "~/utils/supabase/client";
import {
  OperationCard,
  OperationCardDummy,
  OperationCardSkeleton,
} from "../OperationCard";
import { useEffect, useRef } from "react";

const itemsPerPage = 20;

export default function RecentOperationsDisplay() {
  const supabase = createClient();

  const lastOperationCardRef = useRef<HTMLDivElement>(null);

  const recentOperations = useInfiniteQuery({
    queryKey: ["recentOperations"],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: { from: number; to: number };
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("operations_filemetadata")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("file_origin", "PlayportalBackend")
        .eq("user_id", user.id)
        .range(pageParam.from, pageParam.to)
        .limit(itemsPerPage);

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length < itemsPerPage) {
        return null;
      }

      return {
        from: lastPageParam.to,
        to: lastPageParam.to + itemsPerPage + 1,
      };
    },
    initialPageParam: {
      from: 0,
      to: itemsPerPage,
    },
  });

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0]?.isIntersecting &&
        recentOperations.hasNextPage &&
        !recentOperations.isFetching
      ) {
        void recentOperations.fetchNextPage();
      }
    });

    if (lastOperationCardRef.current) {
      observer.observe(lastOperationCardRef.current);
    }

    return () => observer.disconnect();
  }, [recentOperations]);

  return (
    <div className="mt-2 grid  grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recentOperations.data?.pages ? (
        recentOperations.data.pages
          .flat(1)
          ?.map((operation) => (
            <OperationCard
              operation={operation}
              key={operation.operation_id}
              ref={lastOperationCardRef}
            />
          ))
      ) : recentOperations.isLoading ? (
        <>
          <OperationCardSkeleton />
          <OperationCardSkeleton />
          <OperationCardSkeleton />
          <OperationCardSkeleton />
        </>
      ) : (
        <OperationCardDummy />
      )}
    </div>
  );
}
