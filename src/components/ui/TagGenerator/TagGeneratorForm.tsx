import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { TagGeneratorFormSchema } from "~/definitions/form-schemas";
import { useGenerateTags } from "~/hooks/use-generate-tags";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { Button } from "../Button";
import { Input } from "../Input";
import LoaderStatus from "../LoaderStatus";

interface TagGeneratorFormProps {
  setModalOpen: (open: boolean) => void;
  setTagsCallback: (newTags: string[]) => void;
  defaultTagQuery: string;
}

export default function TagGeneratorForm({ ...props }: TagGeneratorFormProps) {
  const { setTagsCallback, defaultTagQuery, setModalOpen } = props;

  const tagsQuery = useGenerateTags();

  const form = useForm<z.infer<typeof TagGeneratorFormSchema>>({
    resolver: zodResolver(TagGeneratorFormSchema),
    defaultValues: {
      queryString: defaultTagQuery,
    },
  });

  const [generatedTags, setGeneratedTags] = useState<string>("");

  const onSubmit = async (data: z.infer<typeof TagGeneratorFormSchema>) => {
    const tagQuery = await tagsQuery.mutateAsync({
      queryString: data.queryString,
      maxTagsLength: 475,
    });

    // Generated tags is used to display them in this modal
    setGeneratedTags(tagQuery.join(","));
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit(onSubmit)();
        }}
      >
        <FormField
          control={form.control}
          name="queryString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag Query String</FormLabel>
              <FormControl>
                <Input placeholder="drake type beat" {...field} />
              </FormControl>
              <FormDescription>
                We will find tags related to this string
              </FormDescription>
              <FormMessage>
                {" "}
                {form.formState.errors.queryString?.message}{" "}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={tagsQuery.isPending} className="w-full">
          <LoaderStatus
            text="Generate Tags"
            isLoading={tagsQuery.isPending}
            loaderProps={{ size: 20 }}
          />
        </Button>

        {generatedTags && (
          <div className="flex rounded-lg bg-white p-2">
            <p className="font-mono text-sm text-black">{generatedTags}</p>
          </div>
        )}
        <Button
          type="button"
          onClick={() => {
            setTagsCallback(tagsQuery.data ?? []);
            setModalOpen(false);
          }}
        >
          Accept Tags
        </Button>
      </form>
    </Form>
  );
}
