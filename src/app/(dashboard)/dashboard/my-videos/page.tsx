"use client";
import { columns } from "~/components/ui/MyVideosTable/columns";
import { DataTable } from "~/components/ui/DataTable";
import { api } from "~/trpc/react";
import { Link } from "~/components/ui/Link";

export default function MyVideosPage() {
  // We maybe want to use separate query hashes for different pages
  const myVideos = api.user.getUserVideos.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined;
      },
    },
  );

  return (
    <div className="flex flex-col overflow-x-clip">
      <Link variant={"button"} href={"/dashboard/create-video"} className="self-end mb-2">
        Create a video
      </Link>
      <DataTable
        isLoading={myVideos.isLoading}
        columns={columns}
        data={
          myVideos.data?.pages
            .flatMap((page) => page.data ?? [])
            .map((transaction) => transaction) ?? []
        }
        fetchNext={myVideos.fetchNextPage}
        fetchPrevious={myVideos.fetchPreviousPage}
      />
    </div>
  );
}
