import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { CreateVideoFormUploadImageSchema } from "~/definitions/form-schemas";
import { Form, FormField, FormItem, FormMessage } from "../../Form";
import { motion } from "framer-motion";
import ImageFileDropzone from "../ImageFileDropzone";
import { useStepper } from "../../Stepper";
import CreateVideoFormActions from "../CreateVideoFormActions";
import { useCreateVideoForm } from "../CreateVideoFormContext";

export default function UploadImageFormStep({
  maxImageFileSizeBytes,
}: {
  maxImageFileSizeBytes: number;
}) {
  const {
    imageFile,
    imageObjectURL,
    setImageFile,
    setImageObjectURL,
    setUploadImageFormStep,
  } = useCreateVideoForm();

  const { nextStep } = useStepper();

  const form = useForm<z.infer<typeof CreateVideoFormUploadImageSchema>>({
    resolver: zodResolver(CreateVideoFormUploadImageSchema),
    defaultValues: {
      imageFile: imageFile ?? null,
    },
    values: {
      imageFile: imageFile ?? null,
    },
  });

  const onImageFileChange = useCallback(
    (file: File | undefined) => {
      if (!file) {
        return;
      }

      if (file.size > maxImageFileSizeBytes) {
        form.setError("imageFile", {
          type: "fileSize",
          message: `Passed image file is too large (${(
            file.size /
            1024 /
            1024
          ).toFixed(
            2,
          )} MB), must be less than ${maxImageFileSizeBytes / 1024 / 1024}MB`,
        });
        return;
      }
      setImageFile(file);
    },
    [maxImageFileSizeBytes, form, setImageFile],
  );

  const onSubmit = (data: z.infer<typeof CreateVideoFormUploadImageSchema>) => {
    console.log("Second step submitted", data);
    setUploadImageFormStep(data);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="z-[50]">
        <FormField
          name={"imageFile"}
          control={form.control}
          render={({ field }) => (
            <motion.div
              className="z-[47] h-full w-full"
              initial={{ opacity: 0, x: "-12vw" }}
              animate={{ opacity: 1, x: "0" }}
              transition={{
                type: "just",
              }}
              exit={{ opacity: 0 }}
              key="1"
            >
              <FormItem>
                <ImageFileDropzone
                  imageObjectURL={imageObjectURL}
                  imageFileName={imageFile?.name}
                  allowedImageFileSizeBytes={maxImageFileSizeBytes}
                  onDrop={(acceptedFiles) => {
                    field.onChange(acceptedFiles[0]);
                    onImageFileChange(acceptedFiles[0]);
                  }}
                  onDropAccepted={(imageFile) => {
                    if (!imageFile[0]) return;
                    const objectURL = URL.createObjectURL(imageFile[0]);
                    setImageObjectURL(objectURL);

                    // Calling this here to automatically submit this form step when the user drops a file
                    void form.handleSubmit(onSubmit)();
                  }}
                  onImageFileRemoved={() => {
                    if (imageObjectURL) URL.revokeObjectURL(imageObjectURL);
                    setUploadImageFormStep(null);
                    setImageFile(null);
                    setImageObjectURL(null);
                  }}
                />
              </FormItem>
            </motion.div>
          )}
        />
        <FormMessage>
          {" "}
          {form.formState?.errors?.imageFile?.message?.toString()}{" "}
        </FormMessage>
        <CreateVideoFormActions />
      </form>
    </Form>
  );
}
