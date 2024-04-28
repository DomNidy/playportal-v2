"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { Button } from "~/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/Form";
import { Input } from "~/components/ui/Input";
import { useState } from "react";
import { Label } from "~/components/ui/Label";
import { CreateVideoFormSchema } from "~/definitions/form-schemas";
import { api } from "~/trpc/react";
import { getFileExtension } from "~/utils/helpers";
import { toast } from "../Toasts/use-toast";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 60 * 1024 * 1024; // 60MB

export default function CreateVideoForm() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const genUploadURL = api.upload.generateUploadURL.useMutation();

  const form = useForm({
    resolver: zodResolver(CreateVideoFormSchema),
    defaultValues: {
      videoTitle: "My video",
      audioFile: audioFile ?? "",
      imageFile: imageFile ?? "",
    } as z.infer<typeof CreateVideoFormSchema>,
  });

  // Form submit handler
  async function onSubmit(data: z.infer<typeof CreateVideoFormSchema>) {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "No audio file was entered.",
        variant: "destructive",
      });
      return;
    }

    const audioFileExtension = getFileExtension(audioFile.name);
    const imageFileExtension = imageFile
      ? getFileExtension(imageFile?.name)
      : null;

    //* Send request to api to generate a presigned-url so that we can upload the files
    const generatedURL = genUploadURL.mutate(
      {
        videoTitle: data.videoTitle,
        audioFileContentType: audioFile.type,
        audioFileExtension: audioFileExtension,
        audioFileSize: audioFile.size,
        imageFileContentType: imageFile?.type,
        imageFileExtension: imageFileExtension,
        imageFileSize: imageFile?.size,
      },
      {
        onError(error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );

    generatedURL;
  }

  function onAudioFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_AUDIO_SIZE) {
      form.setError("audioFile", {
        type: "fileSize",
        message: `Passed audio file is too large (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB), must be less than ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
      });
      return;
    }

    setAudioFile(file);
  }

  function onImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      form.setError("imageFile", {
        type: "fileSize",
        message: `Passed image file is too large (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB), must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      });
      return;
    }
    setImageFile(file);
  }

  return (
    <Form {...form}>
      <form
        className="w-96 rounded-lg border-2 border-border p-4"
        onSubmit={form.handleSubmit((data) => {
          void onSubmit({
            videoTitle: data.videoTitle,
            audioFile: audioFile!,
            imageFile: imageFile!,
          });
        })}
      >
        <FormField
          control={form.control}
          name="videoTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Title</FormLabel>
              <FormControl>
                <Input placeholder="My video" {...field} />
              </FormControl>
              <FormDescription>
                Name of the video, this will not be the final title on youtube,
                it is just used for internal organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name={"audioFile"}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audio File</FormLabel>
              <FormControl>
                {/** TODO: Abstract this into its own component (the styling & logic for onChange) */}
                <div className="flex flex-col">
                  <Input
                    {...field}
                    id="audioFile"
                    type="file"
                    accept="audio/wav, audio/mpeg"
                    aria-label="Audio File Upload"
                    style={{
                      display: "none",
                    }}
                    onChange={(event) => {
                      onAudioFileChange(event);
                      field.onChange(event);
                    }}
                  />
                  <Label
                    htmlFor="audioFile"
                    className="inline-flex w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {audioFile ? audioFile.name : "Upload Audio File"}
                  </Label>
                </div>
              </FormControl>
              <FormDescription>Upload the audio file</FormDescription>
              <FormMessage>
                {" "}
                {form.formState.errors?.audioFile?.message?.toString()}{" "}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          name={"imageFile"}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image File</FormLabel>
              <FormControl>
                <div className="flex flex-col">
                  <Input
                    {...field}
                    id="imageFile"
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    aria-label="Image File Upload"
                    style={{
                      display: "none",
                    }}
                    onChange={(event) => {
                      onImageFileChange(event);
                      field.onChange(event);
                    }}
                  />
                  <Label
                    htmlFor="imageFile"
                    className="inline-flex w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {imageFile ? imageFile.name : "Upload Image File"}
                  </Label>
                </div>
              </FormControl>
              <FormDescription>Upload the image file</FormDescription>
              <FormMessage>
                {" "}
                {form.formState.errors?.imageFile?.message?.toString()}{" "}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={genUploadURL.isPending}>
          Create Video
        </Button>
      </form>
    </Form>
  );
}
