import React from "react";

interface DescriptionTemplateCardProps {
  templateId: string;
  templateName: string;
}

export default function DescriptionTemplateCard({
  ...props
}: DescriptionTemplateCardProps) {
  const { templateId, templateName } = props;
  return (
    <div className="w-full bg-neutral-700 p-2 rounded-lg">
      <h2 className="text-lg font-bold">{templateName}</h2>
      <p className="overflow-ellipsis text-sm text-muted-foreground">
        {templateId}
      </p>
    </div>
  );
}
