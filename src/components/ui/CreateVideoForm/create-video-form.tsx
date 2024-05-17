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
import AudioFileDropzone from "./AudioFileDropzone";
import ImageFileDropzone from "./ImageFileDropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { type VideoPreset } from "~/definitions/api-schemas";

// Hardcoded at 15MB
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export default function CreateVideoForm({
  fileSizeQuotaLimitBytes,
}: {
  fileSizeQuotaLimitBytes: number;
}) {
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
      videoPreset: "YouTube" as keyof typeof VideoPreset,
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
        videoPreset: data.videoPreset,
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

      if (file.size > fileSizeQuotaLimitBytes) {
        form.setError("audioFile", {
          type: "fileSize",
          message: `Passed audio file is too large (${(
            file.size /
            1024 /
            1024
          ).toFixed(
            2,
          )} MB), must be less than ${fileSizeQuotaLimitBytes / 1024 / 1024}MB`,
        });
        return;
      }

      setAudioFile(file);
    },
    [fileSizeQuotaLimitBytes, form],
  );

  const onImageFileChange = useCallback(
    (file: File | undefined) => {
      if (!file) {
        return;
      }

      if (file.size > fileSizeQuotaLimitBytes) {
        form.setError("imageFile", {
          type: "fileSize",
          message: `Passed image file is too large (${(
            file.size /
            1024 /
            1024
          ).toFixed(
            2,
          )} MB), must be less than ${fileSizeQuotaLimitBytes / 1024 / 1024}MB`,
        });
        return;
      }
      setImageFile(file);
    },
    [fileSizeQuotaLimitBytes, form],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          void onSubmit({
            videoTitle: data.videoTitle,
            audioFile: audioFile!,
            imageFile: imageFile!,
            videoPreset: data.videoPreset,
          });
        })}
      >
        {formStage === "UploadAudio" && (
          <>
            {/* Only display the continue button when we have an audio file */}
            {form.getValues().audioFile && (
              <div className="flex-end flex">
                <Button
                  className="ml-auto"
                  onClick={() => {
                    if (!form.getValues().audioFile) {
                      toast({
                        title: "Error",
                        description: "No audio file was entered.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setFormStage("UploadImage");
                  }}
                >
                  Next
                </Button>
              </div>
            )}

            <FormField
              name={"audioFile"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio File</FormLabel>
                  <AudioFileDropzone
                    audioFileName={audioFile?.name}
                    allowedAudioFileSizeBytes={fileSizeQuotaLimitBytes}
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
          </>
        )}

        {formStage === "UploadImage" && (
          <>
            <div className="flex justify-between">
              <Button onClick={() => setFormStage("UploadAudio")}>
                Go back
              </Button>

              {/* Only display the continue button when we have an image file */}
              {form.getValues().imageFile && (
                <Button
                  onClick={() => {
                    if (!form.getValues().imageFile) {
                      toast({
                        title: "Error",
                        description: "No image file was entered.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setFormStage("VideoOptions");
                  }}
                >
                  Next
                </Button>
              )}
            </div>

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
          </>
        )}

        {formStage === "VideoOptions" && (
          <>
            <Button
              type="button"
              tabIndex={0}
              onClick={() => setFormStage("UploadImage")}
            >
              Go back
            </Button>
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
            <Select
              defaultValue="YouTube"
              onValueChange={(value) => {
                // Check if the value is a valid preset
                if (value in CreateVideoFormSchema.shape.videoPreset.enum) {
                  form.setValue("videoPreset", value as VideoPreset);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(
                  CreateVideoFormSchema.shape.videoPreset.enum,
                ).map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              tabIndex={1}
              type="submit"
              className="text-black"
              disabled={isUploadingFiles || genUploadURL.isPending}
            >
              Create video
            </Button>
          </>
        )}

        {isUploadingFiles && <p className="mt-2">Uploading files...</p>}
      </form>
    </Form>
  );
}
