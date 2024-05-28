"use client";
import { Controller, useForm } from "react-hook-form";
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
import React, { useCallback, useEffect, useState } from "react";
import {
  CreateVideoFormSchema,
  YoutubeVideoVisibilities,
} from "~/definitions/form-schemas";
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
} from "../Select/Select";
import { type VideoPreset } from "~/definitions/api-schemas";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/Avatar";
import { Checkbox } from "../Checkbox/Checkbox";
import { useLinkedYoutubeAccounts } from "~/hooks/use-linked-youtube-accounts";
import TagsInput from "./TagsInput";
import posthog from "posthog-js";
import MultiSelectFormField from "../MultiSelect/MultiSelect";
import { Textarea } from "../Textarea/Textarea";

// Hardcoded at 8MB
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export default function CreateVideoForm({
  fileSizeQuotaLimitBytes,
  uploadVideoFeature,
}: {
  fileSizeQuotaLimitBytes: number;
  uploadVideoFeature?: boolean;
}) {
  useEffect(() => {
    posthog.capture("create_video_form_viewed");
  }, []);

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

  // TODO: Even users without the proper feature flags will be fetching the linked youtube accounts data, we should only fetch this data if the user has the feature flag
  // We may be able to modify the hook to check if user has the feature flag and return disabled fetching if they do not
  const {
    data: connectedYoutubeAccounts,
    isLoading: isLoadingYoutubeAccounts,
    isFetching: isFetchingYoutubeAccounts,
    refetch: refetchYoutubeAccounts,
  } = useLinkedYoutubeAccounts();

  const form = useForm({
    resolver: zodResolver(CreateVideoFormSchema),
    defaultValues: {
      videoTitle: "My video",
      audioFile: audioFile ?? "",
      imageFile: imageFile ?? "",
      videoPreset: "YouTube" as keyof typeof VideoPreset,
    } as z.infer<typeof CreateVideoFormSchema>,
  });

  // Is the upload video section toggled (with checkbox)
  const [isUploadVideoChecked, setIsUploadVideoChecked] =
    useState<boolean>(false);

  // Form submit handler
  async function onSubmit(data: z.infer<typeof CreateVideoFormSchema>) {
    console.log("data", data);

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

    // Send request to api to generate a presigned-url so that we can upload the files
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
        uploadVideoOptions: data.uploadVideoOptions,
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
        className="pb-4"
        onSubmit={form.handleSubmit((data) => {
          const dataToSubmit = {
            audioFile: audioFile!,
            imageFile: imageFile!,
            videoTitle: data.videoTitle,

            // Only include the upload video options if the user has checked the box
            videoPreset: data.videoPreset,
            ...(isUploadVideoChecked
              ? { uploadVideoOptions: data.uploadVideoOptions }
              : {}),
          };

          console.log("dataToSubmit", dataToSubmit);

          void onSubmit(dataToSubmit);
        })}
      >
        {formStage === "UploadAudio" && (
          <>
            {/* Only display the continue button when we have an audio file */}
            {form.getValues().audioFile && (
              <div className="flex-end flex">
                <Button
                  type="button"
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
              <Button type="button" onClick={() => setFormStage("UploadAudio")}>
                Go back
              </Button>

              {/* Only display the continue button when we have an image file */}
              {form.getValues().imageFile && (
                <Button
                  type="button"
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
          <div className="space-y-4">
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

            {/** Preset selection */}
            <div>
              <FormLabel>Video preset</FormLabel>
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
                  <SelectValue placeholder="Video preset" />
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
            </div>

            {/** Upload video section */}
            {/** For now we are just supporting youtube here, we will need to change how this form works to support more*/}
            {uploadVideoFeature && (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-row gap-4">
                  <FormLabel>Upload video to YouTube?</FormLabel>
                  <Checkbox
                    onCheckedChange={() =>
                      setIsUploadVideoChecked(!isUploadVideoChecked)
                    }
                  />
                </div>

                {/** Select account to upload to */}

                {isUploadVideoChecked && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <FormLabel>Upload to this YouTube Channel</FormLabel>

                      <div className="dark flex flex-row gap-2">
                        <Controller
                          control={form.control}
                          shouldUnregister={true}
                          defaultValue={undefined}
                          name="uploadVideoOptions.youtube.uploadToChannels"
                          render={({ field }) => (
                            <>
                              <MultiSelectFormField
                                isDataLoading={isLoadingYoutubeAccounts}
                                loadingPlaceholder={
                                  <p className="text-center text-white">
                                    Loading...
                                  </p>
                                }
                                onValueChange={field.onChange}
                                options={
                                  connectedYoutubeAccounts?.map(
                                    (youtubeAccount) => ({
                                      label: youtubeAccount.channelTitle,
                                      value: youtubeAccount.channelId,
                                      icon: () => (
                                        <Avatar className="mr-2 h-[16px] w-[16px] ">
                                          <AvatarImage
                                            src={
                                              youtubeAccount.channelAvatar ?? ""
                                            }
                                            alt="Youtube channel thumbnail"
                                            width={16}
                                            height={16}
                                            className="rounded-full"
                                          />
                                          <AvatarFallback>
                                            {youtubeAccount.channelTitle}
                                          </AvatarFallback>
                                        </Avatar>
                                      ),
                                    }),
                                  ) ?? []
                                }
                                defaultValue={field.value}
                                placeholder="Select a channel"
                              />
                            </>
                          )}
                        />

                        <Button
                          className="w-fit"
                          type="button"
                          disabled={isFetchingYoutubeAccounts}
                          onClick={() => {
                            void refetchYoutubeAccounts();
                          }}
                        >
                          Refresh linked accounts
                        </Button>
                      </div>

                      <FormMessage>
                        {" "}
                        {form?.formState?.errors?.uploadVideoOptions?.youtube?.uploadToChannels?.message?.toString()}{" "}
                      </FormMessage>
                    </div>

                    <FormField
                      control={form.control}
                      defaultValue=""
                      shouldUnregister={true}
                      name="uploadVideoOptions.youtube.videoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube Video Title</FormLabel>
                          <FormControl>
                            <Input placeholder="My video" {...field} />
                          </FormControl>
                          <FormDescription>
                            The title of the video on YouTube
                          </FormDescription>
                          <FormMessage>
                            {form.formState.errors?.uploadVideoOptions?.youtube?.videoTitle?.message?.toString()}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      shouldUnregister={true}
                      defaultValue=""
                      name="uploadVideoOptions.youtube.videoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube Video Description</FormLabel>
                          <FormControl>
                            <Textarea
                              maxLength={5000}
                              placeholder="My video description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The description of the video on YouTube
                          </FormDescription>
                          <FormMessage>
                            {form.formState.errors?.uploadVideoOptions?.youtube?.videoDescription?.message?.toString()}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      shouldUnregister={true}
                      name="uploadVideoOptions.youtube.videoTags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube Video Tags</FormLabel>
                          <FormControl>
                            <TagsInput
                              controllerRenderProps={{
                                name: field.name,
                                ref: field.ref,
                                onBlur: field.onBlur,
                                onChange: field.onChange,
                                disabled: field.disabled,
                                // We don't need to set the value here since the TagsInput component will handle that
                                value: null,
                              }}
                              onKeywordsChange={(keywords) => {
                                field.onChange(keywords);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma separated list of tags for the video on
                            YouTube
                          </FormDescription>
                          <FormMessage>
                            {form.formState.errors?.uploadVideoOptions?.youtube?.videoTags?.message?.toString()}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <Controller
                      control={form.control}
                      shouldUnregister={true}
                      name="uploadVideoOptions.youtube.videoVisibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Visibility</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                          >
                            <SelectTrigger
                              className="w-[180px]"
                              ref={field.ref}
                              onBlur={field.onBlur}
                            >
                              <SelectValue placeholder="Video visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(YoutubeVideoVisibilities).map(
                                (visibility) => (
                                  <SelectItem
                                    key={visibility}
                                    value={visibility}
                                  >
                                    {visibility}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>

                          <FormDescription>
                            The visibility of the video on YouTube, you can
                            change this on YouTube later
                          </FormDescription>

                          <FormMessage>
                            {form.formState.errors?.uploadVideoOptions?.youtube?.videoVisibility?.message?.toString()}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            <Button
              tabIndex={1}
              type="submit"
              className="mb-4 text-black"
              disabled={
                isUploadingFiles ||
                genUploadURL.isPending ||
                form.formState.isSubmitting
              }
            >
              Create video
            </Button>
          </div>
        )}

        {isUploadingFiles && <p className="mt-2">Uploading files...</p>}
      </form>
    </Form>
  );
}
