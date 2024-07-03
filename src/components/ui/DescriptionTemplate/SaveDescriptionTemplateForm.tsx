import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { SaveDescriptionTemplateFormSchema } from "~/definitions/form-schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { saveDescriptionTemplate } from "~/server/actions";
import { toast } from "../Toasts/use-toast";
import { Input } from "../Input";
import { Textarea } from "../Textarea";
import { Button } from "../Button";
import LoaderStatus from "../LoaderStatus";
import { useQueryClient } from "@tanstack/react-query";

interface SaveDescriptionTemplateFormProps {
  initialDescriptionText?: string;
}

export default function SaveDescriptionTemplateForm({
  ...props
}: SaveDescriptionTemplateFormProps) {
  const { initialDescriptionText } = props;

  const queryClient = useQueryClient();
  const [descriptionText, setDescriptionText] = React.useState(
    initialDescriptionText ?? "",
  );

  const [templateName, setTemplateName] = React.useState(
    "My Description Template",
  );

  const [saveTemplateMutationState, setSaveTemplateMutationState] =
    React.useState<"idle" | "loading">("idle");

  const form = useForm<z.infer<typeof SaveDescriptionTemplateFormSchema>>({
    resolver: zodResolver(SaveDescriptionTemplateFormSchema),
    values: {
      platform: "YouTube",
      templateName,
      descriptionText,
    },
  });

  const onSubmit = async (
    data: z.infer<typeof SaveDescriptionTemplateFormSchema>,
  ) => {
    try {
      setSaveTemplateMutationState("loading");
      const res = await saveDescriptionTemplate({
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
        toast({
          description: res.text,
          title: "Success",
          variant: "default",
        });

        // TODO: Close the modal
      } else if (res.status === "error") {
        form.setError("descriptionText", { message: res.text });
      }
    } catch (err) {
      console.error(err);
    }
    setSaveTemplateMutationState("idle");
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
          shouldUnregister
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Textarea
                  maxLength={5000}
                  placeholder="Template Name"
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
        <Button
          type="submit"
          disabled={saveTemplateMutationState === "loading"}
        >
          <LoaderStatus
            text="Save Template"
            isLoading={saveTemplateMutationState === "loading"}
            loaderProps={{ size: 20 }}
          />
        </Button>
      </form>
    </Form>
  );
}
