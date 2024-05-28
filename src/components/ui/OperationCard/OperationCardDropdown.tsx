"use client";
import { Ellipsis, DownloadIcon } from "lucide-react";
import { DownloadFileButton } from "../DownloadFileButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu/DropdownMenu";
import { useState } from "react";
import { type Database } from "types_db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../AlertDialog/AlertDialog";
import { DeleteOperationButton } from "./DeleteOperationButton";
import { Link } from "~/components/ui/Link";

export default function OperationCardDropdown({
  operation,
}: {
  operation: Database["public"]["Views"]["operations_filemetadata"]["Row"];
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Ellipsis className="mb-5 ml-auto cursor-pointer rounded-xl  text-white hover:rounded-lg hover:bg-white/20" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          className="ml-10 flex w-48 flex-col bg-colors-background-900"
        >
          <DropdownMenuItem className="group flex cursor-pointer ">
            {" "}
            <DownloadFileButton
              s3Key={operation.s3_key ?? ""}
              props={{
                className:
                  "bg-transparent group-hover:bg-transparent gap-2 px-1 flex w-full justify-between",
              }}
            >
              {" "}
              <span className="text-sm text-muted-foreground group-hover:text-white ">
                Download Video
              </span>
              <DownloadIcon
                className="mb-1 text-muted-foreground group-hover:text-white "
                width={20}
                height={20}
              />
            </DownloadFileButton>
          </DropdownMenuItem>
          <DropdownMenuItem className="group flex cursor-pointer">
            <Link
              href={`/dashboard/operation/${operation.operation_id}`}
              className="flex w-full justify-between gap-2 rounded-lg px-1 py-2 text-muted-foreground group-hover:text-white"
            >
              View all Files
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="group flex cursor-pointer py-0 focus:bg-destructive "
            onSelect={() => setDeleteDialogOpen(!deleteDialogOpen)}
          >
            <div className="flex w-full justify-between gap-2 rounded-lg px-1 py-2 text-muted-foreground group-hover:text-white">
              Delete
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-colors-background-950">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete all files
              associated with this video on the Playportal servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="ml-auto">
            <AlertDialogCancel className="hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <DeleteOperationButton
                operationId={operation.operation_id ?? ""}
                onDeleteSucess={() => setDeleteDialogOpen(false)}
              >
                Delete
              </DeleteOperationButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
