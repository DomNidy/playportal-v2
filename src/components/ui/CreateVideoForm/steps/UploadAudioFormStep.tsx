import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { CreateVideoFormUploadAudioSchema } from "~/definitions/form-schemas";
import { Form, FormField, FormItem, FormMessage } from "../../Form";
import { motion } from "framer-motion";
import AudioFileDropzone from "../AudioFileDropzone";
import { useStepper } from "../../Stepper";
import CreateVideoFormActions from "../CreateVideoFormActions";
import { useCreateVideoForm } from "../CreateVideoFormContext";

export default function UploadAudioFormStep({
  maxAudioFileSizeBytes,
}: {
  maxAudioFileSizeBytes: number;
}) {
  const {
    setAudioFile,
    setAudioObjectURL,
    audioFile,
    audioObjectURL,
    setUploadAudioFormStep,
  } = useCreateVideoForm();

  const { nextStep } = useStepper();

  const form = useForm<z.infer<typeof CreateVideoFormUploadAudioSchema>>({
    resolver: zodResolver(CreateVideoFormUploadAudioSchema),
    defaultValues: {
      audioFile: audioFile ?? null,
    },
  });

  const onAudioFileChange = useCallback(
    (file: File | undefined) => {
      if (!file) {
        return;
      }

      if (file.size > maxAudioFileSizeBytes) {
        form.setError("audioFile", {
          type: "fileSize",
          message: `Passed audio file is too large (${(
            file.size /
            1024 /
            1024
          ).toFixed(
            2,
          )} MB), must be less than ${maxAudioFileSizeBytes / 1024 / 1024}MB`,
        });
        return;
      }

      setAudioFile(file);
    },
    [maxAudioFileSizeBytes, form, setAudioFile],
  );

  const onSubmit = (data: z.infer<typeof CreateVideoFormUploadAudioSchema>) => {
    console.log("First step submitted", data);
    setUploadAudioFormStep(data);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="z-[50]">
        <FormField
          name={"audioFile"}
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
              <FormItem className="h-[600px]">
                <AudioFileDropzone
                  audioObjectURL={audioObjectURL}
                  audioFileName={audioFile?.name}
                  allowedAudioFileSizeBytes={maxAudioFileSizeBytes}
                  onDrop={(acceptedFiles) => {
                    field.onChange(acceptedFiles[0]);
                    onAudioFileChange(acceptedFiles[0]);
                  }}
                  onDropAccepted={(audioFile) => {
                    if (!audioFile[0]) return;
                    const objectURL = URL.createObjectURL(audioFile[0]);
                    setAudioObjectURL(objectURL);

                    // Calling this here to automatically submit this form step when the user drops a file
                    void form.handleSubmit(onSubmit)();
                  }}
                />
                <FormMessage>
                  {" "}
                  {form.formState?.errors?.audioFile?.message?.toString()}{" "}
                </FormMessage>
              </FormItem>
            </motion.div>
          )}
        />
        <CreateVideoFormActions />
      </form>
    </Form>
  );
}
