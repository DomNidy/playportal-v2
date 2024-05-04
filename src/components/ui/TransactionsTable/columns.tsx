"use client";
import { type Database } from "types_db";
import { type ColumnDef } from "@tanstack/react-table";
import Typography from "../Typography";
import { Button } from "../Button";
import { ArrowUpDown } from "lucide-react";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

// Note: Columns are where you define the core of what your table will look like.
// They define the data that will be displayed, how it will be formatted, sorted and filtered.
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return (
        <code className="relative w-min rounded px-[0.3rem] py-[0.2rem] text-justify font-mono text-sm font-semibold">
          {row.original.id}
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
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          {row.original.amount}
        </Typography>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <Typography variant={"p"} affects={"small"}>
          {row.original.type}
        </Typography>
      );
    },
  },
];
