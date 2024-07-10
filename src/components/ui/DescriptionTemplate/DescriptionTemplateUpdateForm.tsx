import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { UpdateDescriptionTemplateFormSchema } from "~/definitions/form-schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { updateDescriptionTemplate } from "~/server/actions";
import { toast } from "../Toasts/use-toast";
import { Input } from "../Input";
import { Textarea } from "../Textarea";
import { Button } from "../Button";
import LoaderStatus from "../LoaderStatus";
import { useQueryClient } from "@tanstack/react-query";
import { useFullDescriptionTemplate } from "~/hooks/use-full-description-template";

interface DescriptionTemplateUpdateFormProps {
  onUpdateDescriptionTemplateCancel: () => void;
  onUpdateDescriptionTemplateSuccess: (templateId: string) => void;
  templateId: string;
  initialTemplateName?: string;
  initialDescriptionText?: string;
}

export default function DescriptionTemplateUpdateForm({
  ...props
}: DescriptionTemplateUpdateFormProps) {
  const {
    initialDescriptionText,
    onUpdateDescriptionTemplateCancel,
    onUpdateDescriptionTemplateSuccess,
    templateId,
    initialTemplateName,
  } = props;

  const queryClient = useQueryClient();

  const fullDescription = useFullDescriptionTemplate(templateId);

  const [descriptionText, setDescriptionText] = React.useState(
    initialDescriptionText ?? "",
  );

  const [templateName, setTemplateName] = React.useState(
    initialTemplateName ?? "My Description Template",
  );

  const [updateTemplateMutationState, setUpdateTemplateMutationState] =
    React.useState<"idle" | "loading">("idle");

  const form = useForm<z.infer<typeof UpdateDescriptionTemplateFormSchema>>({
    resolver: zodResolver(UpdateDescriptionTemplateFormSchema),
    values: {
      templateId,
      platform: "YouTube",
      templateName,
      descriptionText,
    },
  });

  useEffect(() => {
    console.log("Full description data changed", fullDescription.data);

    if (fullDescription?.data?.descriptionText) {
      setDescriptionText(fullDescription.data.descriptionText);
    }
  }, [form, fullDescription.data]);

  const onSubmit = async (
    data: z.infer<typeof UpdateDescriptionTemplateFormSchema>,
  ) => {
    try {
      setUpdateTemplateMutationState("loading");
      const res = await updateDescriptionTemplate({
        id: data.templateId,
        descriptionText: data.descriptionText,
        platform: "YouTube",
        templateName: data.templateName,
      });

      if (res.status === "ratelimited") {
        toast({
          description: res.text,
          title: "Error",
          variant: "destructive",
        });
      } else if (res.status === "success") {
        toast({
          description: res.text,
          title: "Success",
          variant: "default",
        });

        void queryClient.invalidateQueries({
          queryKey: ["user", "descriptions"],
        });
        onUpdateDescriptionTemplateSuccess(data.templateId);
      } else if (res.status === "error") {
        form.setError("descriptionText", { message: res.text });
      }
    } catch (err) {
      console.error(err);
    }
    setUpdateTemplateMutationState("idle");
    void queryClient.invalidateQueries({ queryKey: ["user", "descriptions"] });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          // This is here to prevent this form from submitting the upload options form
          // These are displayed on the same screen, and this submit event propagates to the parent form
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit(onSubmit)();
        }}
      >
        <FormField
          control={form.control}
          name="templateName"
          shouldUnregister
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Template Name"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setTemplateName(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.templateName?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionText"
          disabled={fullDescription.isLoading}
          shouldUnregister
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description Text</FormLabel>
              <FormControl>
                <Textarea
                  maxLength={5000}
                  placeholder="Some description text..."
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setDescriptionText(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.descriptionText?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <div className=" flex w-full flex-row justify-between">
          <Button
            variant={"ghost"}
            type="button"
            onClick={() => onUpdateDescriptionTemplateCancel()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateTemplateMutationState === "loading"}
          >
            <LoaderStatus
              text="Save Template"
              isLoading={updateTemplateMutationState === "loading"}
              loaderProps={{ size: 20 }}
            />
          </Button>
        </div>
      </form>
    </Form>
  );
}
