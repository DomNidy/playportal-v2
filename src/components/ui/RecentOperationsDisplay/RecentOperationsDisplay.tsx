"use client";
import {
  OperationCard,
  OperationCardDummy,
  OperationCardSkeleton,
} from "../OperationCard";
import { useEffect, useRef } from "react";
import useRecentOperations from "~/hooks/use-recent-operations";

const itemsPerPage = 20;

export default function RecentOperationsDisplay() {
  const lastOperationCardRef = useRef<HTMLDivElement>(null);
  const {
    data: recentOperations,
    isFetching,
    isFetched,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = useRecentOperations({ itemsPerPage });

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetching) {
        void fetchNextPage();
      }
    });

    if (lastOperationCardRef.current) {
      observer.observe(lastOperationCardRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching]);

  const hasNoOperations =
    recentOperations?.pages?.length === 1 &&
    recentOperations.pages?.[0]?.length === 0;

  return (
    <div className="mt-2 grid  grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recentOperations?.pages
        ? recentOperations.pages
            .flat(1)
            ?.map((operation) => (
              <OperationCard
                operation={operation}
                key={operation.operation_id}
                ref={lastOperationCardRef}
              />
            ))
        : isLoading && (
            <>
              <OperationCardSkeleton />
              <OperationCardSkeleton />
              <OperationCardSkeleton />
              <OperationCardSkeleton />
            </>
          )}

      {hasNoOperations && isFetched && <OperationCardDummy />}
    </div>
  );
}
