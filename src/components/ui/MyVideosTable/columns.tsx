"use client";
import { type Database } from "types_db";
import { type ColumnDef } from "@tanstack/react-table";
import Typography from "../Typography/Typography";
import { Button } from "../Button";
import { ArrowUpDown, DownloadIcon } from "lucide-react";
import { DownloadFileButton } from "../DownloadFileButton";

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
        <code className="relative w-min rounded px-[0.3rem] py-[0.2rem] text-justify font-mono text-sm font-semibold">
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
      return (
        <DownloadFileButton
          s3Key={row.original.s3_key ?? ""}
          props={{
            className:
              "text-black  group-hover:bg-transparent gap-2 px-1 flex w-full justify-between",
          }}
        >
          {" "}
          <span className="text-sm   ">Download Video</span>
          <DownloadIcon className="mb-1 text-black" width={20} height={20} />
        </DownloadFileButton>
      );
    },
  },
];
