import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { ApplyDescriptionTemplateFormSchema } from "~/definitions/form-schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { Textarea } from "../Textarea";
import { useFullDescriptionTemplate } from "~/hooks/use-full-description-template";
import { Button } from "../Button";

interface DescriptionTemplateApplyFormProps {
  selectedDescriptionTemplateId: string | null;
  onCancelApplyDescriptionTemplate: () => void;
  onApplyDescriptionTemplate: (newDescription: string) => void;
}

export default function DescriptionTemplateApplyForm({
  ...props
}: DescriptionTemplateApplyFormProps) {
  const {
    selectedDescriptionTemplateId,
    // Called when the
    onApplyDescriptionTemplate,
    onCancelApplyDescriptionTemplate,
  } = props;

  const form = useForm<z.infer<typeof ApplyDescriptionTemplateFormSchema>>({
    resolver: zodResolver(ApplyDescriptionTemplateFormSchema),
  });

  const onSubmit = (
    data: z.infer<typeof ApplyDescriptionTemplateFormSchema>,
  ) => {
    onApplyDescriptionTemplate(data.description);
  };

  const fullDescription = useFullDescriptionTemplate(
    selectedDescriptionTemplateId ?? "",
  );

  useEffect(() => {
    if (fullDescription.data?.descriptionText) {
      form.setValue("description", fullDescription.data.descriptionText);
    }
  }, [form, fullDescription.data]);

  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          // This is here to prevent this form from submitting the upload options form
          // These are displayed on the same screen, and this submit event propagates to the parent form
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit(onSubmit)();
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          shouldUnregister={true}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube Video Description</FormLabel>
              <FormControl>
                <Textarea
                  maxLength={5000}
                  {...field}
                  placeholder="Enter description here"
                  disabled={fullDescription.isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className=" flex w-full flex-row justify-between">
          <Button
            variant={"ghost"}
            type="button"
            onClick={() => onCancelApplyDescriptionTemplate()}
          >
            Cancel
          </Button>
          <Button type="submit">Apply</Button>
        </div>
      </form>
    </Form>
  );
}
