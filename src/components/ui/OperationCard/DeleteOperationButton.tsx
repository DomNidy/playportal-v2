"use client";
import { api } from "~/trpc/react";
import { Button } from "../Button";
import { toast } from "../Toasts/use-toast";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MoonLoader } from "react-spinners";
import type useRecentOperations from "~/hooks/use-recent-operations";

export function DeleteOperationButton({
  operationId,
  children,
  onDeleteSucess,
  ...props
}: {
  operationId: string;
  props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  children?: React.ReactNode;
  onDeleteSucess: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteOperation = api.delete.deleteOperationFiles.useMutation({
    onSettled: async () => {
      // Little hacky way to prevent the operation card from immediately being removed
      await new Promise((resolve) => setTimeout(resolve, 105));
      void queryClient.invalidateQueries({ queryKey: ["recentOperations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      onDeleteSucess();

      // Little hacky way to prevent the operation card from immediately being removed
      // Call this after the onDeleteSuccess callback to prevent the operation card from being removed
      await new Promise((resolve) => setTimeout(resolve, 105));

      // Remove the operation we deleted from query data immediately
      queryClient.setQueryData(
        ["recentOperations"],
        (ops: ReturnType<typeof useRecentOperations>["data"]) => {
          console.log(ops);
          const filteredOps = ops?.pages.map((page) =>
            page?.filter((op) => op.operation_id !== operationId),
          );

          console.log(filteredOps);
          return {
            pageParams: ops?.pageParams,
            pages: filteredOps,
          };
        },
      );

      toast({
        title: "Success",
        description: "Video deleted successfully.",
        variant: "default",
      });
    },
  });

  return (
    <Button
      {...props.props}
      variant={"destructive"}
      disabled={deleteOperation.isPending}
      className="bg-opacity-30"
      onClick={() => {
        deleteOperation.mutate({
          operationId: operationId,
        });
      }}
    >
      {deleteOperation.isPending ? (
        <MoonLoader size={20} color={"#fff"} />
      ) : (
        <>{children}</>
      )}
    </Button>
  );
}
