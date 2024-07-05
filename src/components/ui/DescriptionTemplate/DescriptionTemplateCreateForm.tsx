import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { CreateNewDescriptionTemplateFormSchema } from "~/definitions/form-schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { createNewDescriptionTemplate } from "~/server/actions";
import { toast } from "../Toasts/use-toast";
import { Input } from "../Input";
import { Textarea } from "../Textarea";
import { Button } from "../Button";
import LoaderStatus from "../LoaderStatus";
import { useQueryClient } from "@tanstack/react-query";

export interface DescriptionTemplateCreateFormProps {
  onCreateDescriptionTemplateCancel: () => void;
  onCreateDescriptionTemplateSuccess: (newTemplateId: string) => void;
}

export default function DescriptionTemplateCreateForm({
  ...props
}: DescriptionTemplateCreateFormProps) {
  const {
    onCreateDescriptionTemplateCancel,
    onCreateDescriptionTemplateSuccess,
  } = props;

  const queryClient = useQueryClient();
  const [descriptionText, setDescriptionText] = React.useState("");

  const [templateName, setTemplateName] = React.useState(
    "My Description Template",
  );

  const [createTemplateMutationState, setCreateTemplateMutationState] =
    React.useState<"idle" | "loading">("idle");

  const form = useForm<z.infer<typeof CreateNewDescriptionTemplateFormSchema>>({
    resolver: zodResolver(CreateNewDescriptionTemplateFormSchema),
    values: {
      platform: "YouTube",
      templateName,
      descriptionText,
    },
  });

  const onSubmit = async (
    data: z.infer<typeof CreateNewDescriptionTemplateFormSchema>,
  ) => {
    try {
      setCreateTemplateMutationState("loading");
      const res = await createNewDescriptionTemplate({
        descriptionText: data.descriptionText,
        platform: data.platform,
        templateName: data.templateName,
      });

      if (res.status === "ratelimited") {
        toast({
          description: res.text,
          title: "Error",
          variant: "destructive",
        });
      } else if (res.status === "success") {
        // Display a success toast
        toast({
          description: res.text,
          title: "Success",
          variant: "default",
        });

        //* This function should be called before the callback is ran incase that unmounts this component
        void queryClient.invalidateQueries({
          queryKey: ["user", "descriptions"],
        });

        // Update mutation state here
        setCreateTemplateMutationState("idle");

        // Call success callback
        onCreateDescriptionTemplateSuccess(res.templateId);
      } else if (res.status === "error") {
        form.setError("descriptionText", { message: res.text });
      }
    } catch (err) {
      console.error(err);
    }
    setCreateTemplateMutationState("idle");
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
          shouldUnregister
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description Text</FormLabel>
              <FormControl>
                <Textarea
                  maxLength={5000}
                  placeholder="Some description text here..."
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
            onClick={() => onCreateDescriptionTemplateCancel()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createTemplateMutationState === "loading"}
          >
            <LoaderStatus
              text="Create Template"
              isLoading={createTemplateMutationState === "loading"}
              loaderProps={{ size: 20 }}
            />
          </Button>
        </div>
      </form>
    </Form>
  );
}
