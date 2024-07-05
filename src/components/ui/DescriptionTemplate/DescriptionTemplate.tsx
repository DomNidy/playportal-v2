import React, { useState } from "react";
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
import { Button } from "../Button";
import SaveDescriptionTemplateForm from "./SaveDescriptionTemplateForm";
import { FormLabel } from "../Form";
import DescriptionTemplateCard from "./DescriptionTemplateCard";

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

  const [displayedForm, setDisplayedForm] = useState<"create" | "apply">(
    "apply",
  );

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
        <div className="flex w-full flex-col gap-2  max-h-[300px] overflow-y-scroll">
          {descriptions.data?.map((desc) => (
            <DescriptionTemplateCard
              key={desc.id}
              templateId={desc.id}
              templateName={desc.template_name}
            />
          ))}
        </div>
        <div className="flex w-full flex-row gap-2">
          <Button
            disabled={displayedForm === "apply"}
            className="flex-1"
            onClick={() => {
              setDisplayedForm("apply");
            }}
          >
            Select Template
          </Button>
          <Button
            disabled={displayedForm === "create"}
            className="flex-1"
            onClick={() => {
              setDisplayedForm("create");
            }}
          >
            Create Template
          </Button>
        </div>

        {/** TODO: Move this UI to the description template form, allow for updating and deleting the current selected template */}
        {displayedForm === "apply" ? (
          <>
            <FormLabel>Select a Description Template</FormLabel>
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
          </>
        ) : (
          <SaveDescriptionTemplateForm />
        )}
      </DialogContent>
    </Dialog>
  );
}
