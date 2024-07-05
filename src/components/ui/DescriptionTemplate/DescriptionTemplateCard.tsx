import React, { useState } from "react";
import { Button } from "../Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../AlertDialog";
import LoaderStatus from "../LoaderStatus";
import { toast } from "../Toasts/use-toast";
import { deleteDescriptionTemplate } from "~/server/actions";
import { useQueryClient } from "@tanstack/react-query";

interface DescriptionTemplateCardProps {
  templateId: string;
  // If the template associated with this card is currently selected in the DescriptionTemplate component
  isCurrentlySelected: boolean;
  templateName: string;
  // When the select template button is clicked, this function is called with the templateId
  onClickSelectTemplate: (templateId: string, templateName: string) => void;
  // When the edit button is clicked, this function is called with the templateId
  onClickEditTemplate: (templateId: string, templateName: string) => void;
  // Ran when the template is successfully deleted
  onDeleteTemplateSuccess: () => void;
}

export default function DescriptionTemplateCard({
  ...props
}: DescriptionTemplateCardProps) {
  const {
    templateId,
    templateName,
    isCurrentlySelected,
    onDeleteTemplateSuccess,
    onClickEditTemplate,
    onClickSelectTemplate,
  } = props;

  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteMutationStatus, setDeleteMutationStatus] = useState<
    "idle" | "loading"
  >("idle");

  const deleteTemplate = async () => {
    setDeleteMutationStatus("loading");
    try {
      const res = await deleteDescriptionTemplate({
        templateId,
      });

      if (res.status === "success") {
        console.log(res);
        
        void queryClient.invalidateQueries({
          queryKey: ["user", "descriptions"],
        });
        
        setDeleteMutationStatus("idle");
        setDeleteDialogOpen(false);
        onDeleteTemplateSuccess();
      } else {
        throw new Error("Failed to delete template");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting template",
        description:
          "Failed to delete the description template, please try again later or contact support.",
      });
    }
    void queryClient.invalidateQueries({ queryKey: ["user", "descriptions"] });
    setDeleteMutationStatus("idle");
  };

  return (
    <div className="flex w-full flex-row items-center rounded-lg  border p-2">
      <h2 className="grow text-lg font-bold">{templateName}</h2>
      <div className="flex gap-2">
        <Button
          variant={"ghost"}
          onClick={() => onClickEditTemplate(templateId, templateName)}
        >
          Edit
        </Button>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant={"ghost"} className="hover:bg-destructive/50">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="flex flex-col  bg-colors-background-950">
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will delete the description
                template.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="ml-auto flex-row items-end gap-2 ">
              <AlertDialogCancel className="hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void deleteTemplate()}
                  disabled={deleteMutationStatus === "loading"}
                  variant={"default"}
                  type="button"
                >
                  <LoaderStatus
                    text="Delete"
                    isLoading={deleteMutationStatus === "loading"}
                  />
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          disabled={isCurrentlySelected}
          onClick={() => onClickSelectTemplate(templateId, templateName)}
        >
          Select
        </Button>
      </div>
    </div>
  );
}
