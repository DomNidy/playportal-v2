import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogTitle, DialogContent } from "../Dialog";
import DescriptionTemplateForm from "./DescriptionTemplateForm";
import useDescriptionTemplates from "~/hooks/use-description-templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Select";
import { createClient } from "~/utils/supabase/client";
import { useFullDescriptionTemplate } from "~/hooks/use-full-description-template";

interface DescriptionTemplateProps {
  modalOpen: boolean;
  onModalOpenChange: (isOpen: boolean) => void;
  setDescriptionCallback: (newDescription: string) => void;
  triggerButton: React.ReactNode;
}

export default function DescriptionTemplate({
  ...props
}: DescriptionTemplateProps) {
  const {
    modalOpen,
    onModalOpenChange,
    setDescriptionCallback,
    triggerButton,
  } = props;

  const supabase = createClient();

  // We initially only load the description template titles & ids (not the full text)
  // So when we select a template, we need to fetch the full description, we use this to store the selected id

  const [selectedDescriptionTemplateId, setSelectedDescriptionTemplateId] =
    useState<string | null>(null);

  // Used to query for the users description templates (does not return the full description)
  const descriptions = useDescriptionTemplates();

  return (
    <Dialog open={modalOpen} onOpenChange={onModalOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <div className="flex max-w-[300px] flex-col gap-1">
          <DialogTitle>Description Templates</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Quickly save and load description templates for your video
          </p>
        </div>

        <Select
          value={selectedDescriptionTemplateId ?? ""}
          onValueChange={(newTemplateId) =>
            setSelectedDescriptionTemplateId(newTemplateId)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {descriptions.data?.map((desc) => (
              <SelectItem key={desc.id} value={desc.id}>
                {desc.template_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DescriptionTemplateForm
          setDescriptionCallback={setDescriptionCallback}
          selectedDescriptionTemplateId={selectedDescriptionTemplateId}
        />
      </DialogContent>
    </Dialog>
  );
}
