"use client";
import { columns } from "~/components/ui/TransactionsTable/columns";
import { DataTable } from "~/components/ui/TransactionsTable/data-table";
import { api } from "~/trpc/react";

export default function TransactionsPage() {
  // We maybe want to use separate query hashes for different pages
  const transactions = api.transactions.getTransactions.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined;
      },
    },
  );

  return (
    <DataTable
      columns={columns}
      data={
        transactions.data?.pages
          .flatMap((page) => page.data ?? [])
          .map((transaction) => transaction) ?? []
      }
      fetchNext={transactions.fetchNextPage}
      fetchPrevious={transactions.fetchPreviousPage}
    />
  );
}
