"use client";
import { type Database } from "types_db";
import { type ColumnDef } from "@tanstack/react-table";
import Typography from "../Typography";
import { Button } from "../Button";
import { ArrowUpDown } from "lucide-react";
import { api, getBaseUrl } from "~/trpc/react";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import SuperJSON from "superjson";
import Link from "next/link";
import { toast } from "../Toasts/use-toast";

// TODO: We might want to make a composite type that includes the filemeta data here (or a view)
type Transaction =
  Database["public"]["Views"]["operations_filemetadata"]["Row"];

// Note: Columns are where you define the core of what your table will look like.
// They define the data that will be displayed, how it will be formatted, sorted and filtered.
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return (
        <code className="relative w-min rounded bg-muted px-[0.3rem] py-[0.2rem] text-justify font-mono text-sm font-semibold">
          {row.original.operation_id ?? ""}
        </code>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          {new Date(row.original.created_at ?? "").toLocaleString()}
        </Typography>
      );
    },
  },

  {
    accessorKey: "video_title",
    header: ({}) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          Video Title
        </Typography>
      );
    },
    cell: ({ row }) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          {row.original.video_title}
        </Typography>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({}) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          Status
        </Typography>
      );
    },
    cell: ({ row }) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          {row.original.status}
        </Typography>
      );
    },
  },
  {
    accessorKey: "s3_key",
    header: ({}) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          Download
        </Typography>
      );
    },
    cell: ({ row }) => {
      return <DownloadFileButton s3Key={row.original.s3_key ?? ""} />;
    },
  },
];

function DownloadFileButton({ s3Key }: { s3Key: string }) {
  const presignedUrlQuery = api.user.getPresignedUrlForFile.useQuery(
    {
      s3Key: s3Key,
    },
    {
      enabled: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  return (
    <Button
      onClick={async () => {
        const downloadUrl = await presignedUrlQuery.refetch();
        if (!downloadUrl.data) {
          toast({
            title: "Error",
            description: "Failed to get download url, please try again.",
            variant: "destructive",
          });
          return;
        }
        window.open(downloadUrl.data, "_blank");
      }}
    >
      Download
    </Button>
  );
}
