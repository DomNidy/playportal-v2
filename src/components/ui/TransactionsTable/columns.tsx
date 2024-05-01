import { type Database } from "types_db";
import { type ColumnDef } from "@tanstack/react-table";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

// Note: Columns are where you define the core of what your table will look like.
// They define the data that will be displayed, how it will be formatted, sorted and filtered.
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
];
