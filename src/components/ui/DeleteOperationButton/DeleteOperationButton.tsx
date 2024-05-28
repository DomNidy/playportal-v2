"use client";
import { api } from "~/trpc/react";
import { Button } from "../Button";
import { toast } from "../Toasts/use-toast";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";

export function DeleteOperationButton({
  operationId,
  children,
  ...props
}: {
  operationId: string;
  props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  children?: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const deleteOperation = api.delete.deleteOperationFiles.useMutation({
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["recentOperations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Operation deleted successfully.",
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
      {deleteOperation.isPending ? <p>...</p> : <>{children}</>}
    </Button>
  );
}
