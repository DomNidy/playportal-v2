"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/Table";
import { Button } from "~/components/ui/Button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetchNext: () => void;
  fetchPrevious: () => void;
  // We use this to determine if we should show loading states
  isLoading: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchNext,
  fetchPrevious,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
    autoResetPageIndex: false,
  });

  return (
    <div className="flex max-w-[335px] flex-col items-center overflow-clip rounded-lg border-2 sm:max-w-[600px] md:max-w-max">
      <div className="w-full overflow-x-auto ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="overflow-x-scroll">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* If we are loading, and we dont have any data */}
            {isLoading &&
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="h-2 w-full animate-pulse rounded-xl bg-neutral-700"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-2 w-full animate-pulse rounded-xl bg-neutral-700"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-2 w-full animate-pulse rounded-xl bg-neutral-700"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-2 w-full animate-pulse rounded-xl bg-neutral-700"></div>
                  </TableCell>
                </TableRow>
              ))}

            {/* If we're not loading, and we dont have any data*/}
            {!isLoading && !table.getRowModel().rows?.length && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}

            {/*  TODO: This might be what is causing the '0'*/}
            {/* If we have data*/}
            {!isLoading &&
              table.getRowModel().rows?.length &&
              table.getRowModel().rows.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="px-4 w-full border-t-[1.5px] flex items-center justify-end space-x-2 self-end py-4 ">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchPrevious();
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchNext();
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
