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
import { Label } from "~/components/ui/Label";
import { CreateVideoFormSchema } from "~/definitions/form-schemas";
import { api } from "~/trpc/react";
import { getFileExtension } from "~/utils/helpers";
import { toast } from "../Toasts/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Dropzone, {
  Accept,
  useDropzone,
  ErrorCode,
  FileError,
} from "react-dropzone";

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
        className="w-96 rounded-lg border-2 border-border p-6"
        onSubmit={form.handleSubmit((data) => {
          void onSubmit({
            videoTitle: data.videoTitle,
            audioFile: audioFile!,
            imageFile: imageFile!,
          });
        })}
      >
        <Button
          onClick={() => {
            console.log(form.getValues());
          }}
        >
          log formstate
        </Button>

        {formStage === "UploadAudio" && (
          <>
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
                          console.log(field);
                          onImageFileChange(event.target.files?.[0]);
                          field.onChange(event);
                        }}
                      />
                      <Label
                        htmlFor="imageFile"
                        className="inline-flex w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded-md border-[1.5px] border-border bg-primary p-2 
                    text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {imageFile ? imageFile.name : "Upload Image File"}
                      </Label>
                    </div>
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
        <Button
          type="submit"
          className="text-black"
          disabled={isUploadingFiles || genUploadURL.isPending}
        >
          Create video
        </Button>
        {isUploadingFiles && <p className="mt-2">Uploading files...</p>}
      </form>
    </Form>
  );
}

function AudioFileDropzone({
  onDrop,
  allowedAudioFileSizeBytes,
  audioFileName,
}: {
  onDrop: (files: File[]) => void;
  allowedAudioFileSizeBytes: number;
  audioFileName?: string;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mp3": [".mp3"],
      "audio/wav": [".wav"],
    },
    maxFiles: 1,
    maxSize: allowedAudioFileSizeBytes,
    onDropRejected: (files) => {
      const error =
        files[0]?.errors[0]?.code === ErrorCode.FileTooLarge
          ? `File size exceeds your plan's limit of ${(allowedAudioFileSizeBytes / 1024 / 1024).toFixed(2)} MB`
          : files[0]?.errors[0]?.message;

      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
    onDropAccepted: (files) => {
      // TODO: Forward user to next stage of form
      console.log(files);
    },
  });

  console.log(getInputProps());

  return (
    <div
      {...getRootProps()}
      className={`rounded-lg bg-white/10 p-4 ${isDragActive ? "bg-white/20" : ""}`}
    >
      <input {...getInputProps()} />
      {audioFileName ? (
        audioFileName
      ) : isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag files here</p>
      )}
    </div>
  );
}
