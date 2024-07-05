import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogTitle, DialogContent } from "../Dialog";
import useDescriptionTemplates from "~/hooks/use-description-templates";
import DescriptionTemplateApplyForm from "./DescriptionTemplateApplyForm";
import DescriptionTemplateCreateForm from "./DescriptionTemplateCreateForm";
import DescriptionTemplateUpdateForm from "./DescriptionTemplateUpdateForm";
import { Button } from "../Button";
import DescriptionTemplateCard from "./DescriptionTemplateCard";

interface DescriptionTemplateProps {
  modalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  setDescriptionCallback: (newDescription: string) => void;
  triggerButton: React.ReactNode;
}

function getDescriptionTemplateDialogTitle(
  displayedForm: "create" | "update" | "apply",
) {
  switch (displayedForm) {
    case "create":
      return "Create New Description Template";
    case "update":
      return "Update Description Template";
    case "apply":
      return "Description Templates";
  }
}

function getDescriptionTemplateDialogDescription(
  displayedForm: "create" | "update" | "apply",
) {
  switch (displayedForm) {
    case "create":
      return "Create a new description template";
    case "update":
      return "Update an existing description template";
    case "apply":
      return "Quickly save and load description templates for your video";
  }
}

export default function DescriptionTemplate({
  ...props
}: DescriptionTemplateProps) {
  const { modalOpen, setModalOpen, setDescriptionCallback, triggerButton } =
    props;

  const [displayedForm, setDisplayedForm] = useState<
    "create" | "update" | "apply"
  >("apply");

  // We initially only load the description template titles & ids (not the full text)
  // So when we select a template, we need to fetch the full description, we use this to store the selected id

  const [selectedDescriptionTemplateId, setSelectedDescriptionTemplateId] =
    useState<string | null>(null);

  // When we select a template, use this state to store the initial template name
  const [initialTemplateName, setInitialTemplateName] = useState<string>(
    "My Description Template",
  );

  // Used to query for the users description templates (does not return the full description)
  const descriptions = useDescriptionTemplates();

  useEffect(() => {
    console.log("Description templates loaded", descriptions.data);
    if (descriptions.data?.length === 0) {
      setDisplayedForm("create");
    }
  }, [descriptions.data]);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <div className="flex  flex-col gap-1">
          <DialogTitle>
            {getDescriptionTemplateDialogTitle(displayedForm)}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {getDescriptionTemplateDialogDescription(displayedForm)}
          </p>
        </div>

        {displayedForm === "apply" && (
          <div className="flex max-h-[300px] w-full flex-col  gap-2 overflow-y-scroll">
            {descriptions.data?.map((desc) => (
              <DescriptionTemplateCard
                key={desc.id}
                templateId={desc.id}
                templateName={desc.template_name}
                isCurrentlySelected={desc.id === selectedDescriptionTemplateId}
                onDeleteTemplateSuccess={() => {
                  setDisplayedForm("apply");
                }}
                onClickSelectTemplate={(templateId) => {
                  setSelectedDescriptionTemplateId(templateId);
                  setDisplayedForm("apply");
                }}
                onClickEditTemplate={(templateId, templateName) => {
                  setSelectedDescriptionTemplateId(templateId);
                  setInitialTemplateName(templateName);
                  setDisplayedForm("update");
                }}
              />
            ))}
          </div>
        )}

        {displayedForm === "apply" && (
          <Button onClick={() => setDisplayedForm("create")}>
            Create New Description Template
          </Button>
        )}
        {/** When the user wants to apply a selected template */}
        {displayedForm === "apply" && selectedDescriptionTemplateId && (
          <>
            <DescriptionTemplateApplyForm
              selectedDescriptionTemplateId={selectedDescriptionTemplateId}
              onApplyDescriptionTemplate={(newDescription) => {
                setDescriptionCallback(newDescription);
                setModalOpen(false);
              }}
              onCancelApplyDescriptionTemplate={() => setModalOpen(false)}
            />
          </>
        )}

        {/** When the user wants to update a template */}
        {displayedForm === "update" && selectedDescriptionTemplateId && (
          <>
            <DescriptionTemplateUpdateForm
              templateId={selectedDescriptionTemplateId}
              initialDescriptionText=""
              initialTemplateName={initialTemplateName}
              onUpdateDescriptionTemplateCancel={() =>
                setDisplayedForm("apply")
              }
              onUpdateDescriptionTemplateSuccess={(templateId) => {
                setSelectedDescriptionTemplateId(templateId);
                setDisplayedForm("apply");
              }}
            />
          </>
        )}

        {/** When the user wants to create a new template */}
        {displayedForm === "create" && (
          <>
            <DescriptionTemplateCreateForm
              onCreateDescriptionTemplateCancel={() =>
                setDisplayedForm("apply")
              }
              onCreateDescriptionTemplateSuccess={(newTemplateId) => {
                setSelectedDescriptionTemplateId(newTemplateId);
                setDisplayedForm("apply");
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
