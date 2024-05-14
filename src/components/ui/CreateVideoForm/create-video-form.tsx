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
import { useCallback, useState } from "react";
import { CreateVideoFormSchema } from "~/definitions/form-schemas";
import { api } from "~/trpc/react";
import { getFileExtension } from "~/utils/utils";
import { toast } from "../Toasts/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import AudioFileDropzone from "./AudioFIleDropzone";
import ImageFileDropzone from "./ImageFIleDropzone";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 60 * 1024 * 1024; // 60MB

export default function CreateVideoForm() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  //* We only ever set this to true and never reset it back to false since the user is supposed to be redirected
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  //* Used to control which stage of the form is visible
  const [formStage, setFormStage] = useState<
    "UploadAudio" | "UploadImage" | "VideoOptions"
  >("UploadAudio");

  const router = useRouter();
  const queryClient = useQueryClient();
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
    genUploadURL.mutate(
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
        onSettled: () => {
          void queryClient.invalidateQueries({
            queryKey: ["userData"],
          });

          void queryClient.invalidateQueries({
            queryKey: ["transactions", "getTransaction"],
          });
        },
        async onSuccess(data) {
          // Read file data into buffer
          const audioFileBuffer = await audioFile.arrayBuffer();
          const imageFileBuffer = await imageFile?.arrayBuffer();
          // Array of the upload requests
          const putRequests = [];

          // Read urls from the response
          const presignedUrlAudio = data?.presignedUrlAudio;
          const presignedUrlImage = data?.presignedUrlImage;

          setIsUploadingFiles(true);
          if (presignedUrlAudio && audioFileBuffer) {
            putRequests.push(
              fetch(presignedUrlAudio, {
                method: "PUT",
                body: audioFileBuffer,
                headers: {
                  "Content-Type": audioFile.type,
                },
              }),
            );
          }

          if (presignedUrlImage && imageFileBuffer) {
            putRequests.push(
              fetch(presignedUrlImage, {
                method: "PUT",
                body: imageFileBuffer,
              }),
            );
          }

          // After uploads are complete, redirect the user
          await Promise.all(putRequests);
          router.push(`/dashboard/operation/${data?.operationId}`);
        },
      },
    );
  }

  const onAudioFileChange = useCallback(
    (file: File | undefined) => {
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
          ).toFixed(
            2,
          )} MB), must be less than ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
        });
        return;
      }

      setAudioFile(file);
    },
    [form],
  );

  const onImageFileChange = useCallback(
    (file: File | undefined) => {
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
          ).toFixed(
            2,
          )} MB), must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        });
        return;
      }
      setImageFile(file);
    },
    [form],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          void onSubmit({
            videoTitle: data.videoTitle,
            audioFile: audioFile!,
            imageFile: imageFile!,
          });
        })}
      >
        {formStage === "UploadAudio" && (
          <FormField
            name={"audioFile"}
            control={form.control}
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Audio File</FormLabel>
                <AudioFileDropzone
                  audioFileName={audioFile?.name}
                  allowedAudioFileSizeBytes={MAX_AUDIO_SIZE}
                  onDrop={(acceptedFiles) => {
                    field.onChange(acceptedFiles[0]);
                    onAudioFileChange(acceptedFiles[0]);
                  }}
                  onDropAccepted={() => setFormStage("UploadImage")}
                />
                <FormDescription>
                  The audio file to create the video with.
                </FormDescription>
                <FormMessage>
                  {" "}
                  {form.formState.errors?.audioFile?.message?.toString()}{" "}
                </FormMessage>
              </FormItem>
            )}
          />
        )}

        {formStage === "UploadImage" && (
          <FormField
            name={"imageFile"}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image File</FormLabel>
                <FormControl>
                  <ImageFileDropzone
                    allowedImageFileSizeBytes={MAX_IMAGE_SIZE}
                    imageFileName={imageFile?.name}
                    onDrop={(acceptedFiles) => {
                      field.onChange(acceptedFiles[0]);
                      onImageFileChange(acceptedFiles[0]);
                    }}
                    onDropAccepted={() => setFormStage("VideoOptions")}
                  />
                </FormControl>
                <FormDescription>
                  Image to render the video with.
                </FormDescription>
                <FormMessage>
                  {" "}
                  {form.formState.errors?.imageFile?.message?.toString()}{" "}
                </FormMessage>
              </FormItem>
            )}
          />
        )}

        {formStage === "VideoOptions" && (
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
                  Name of the video, this will not be the final title on
                  youtube, it is just used for internal organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/** Swapping the next/Link component for a default button makes the styling fixed, but as link, the background doesnt work? */}
        {formStage === "VideoOptions" && (
          <Button
            type="submit"
            className="text-black"
            disabled={isUploadingFiles || genUploadURL.isPending}
          >
            Create video
          </Button>
        )}

        {isUploadingFiles && <p className="mt-2">Uploading files...</p>}
      </form>
    </Form>
  );
}
