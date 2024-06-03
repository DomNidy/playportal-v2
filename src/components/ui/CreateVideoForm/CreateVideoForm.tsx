"use client";
import { Controller } from "react-hook-form";
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
import { getFileExtension, sendRequest } from "~/utils/utils";
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
import { revalidatePathByServerAction } from "~/utils/actions";
import useMultistepForm from "~/hooks/use-multistep-form";
import { motion } from "framer-motion";
import { Label } from "../Label";
import { Progress } from "../Progress";
import { useCreateVideoForm } from "./CreateVideoFormContext";

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

  const {
    audioFile,
    setAudioFile,
    imageFile,
    setImageFile,
    audioObjectURL,
    form,
    imageObjectURL,
    setImageObjectURL,
    isUploadYoutubeVideoChecked,
    setAudioObjectURL,
    setIsUploadYoutubeVideoChecked,
    setUploadAudioFileProgress,
    setUploadImageFileProgress,
    uploadAudioFileProgress,
    uploadImageFileProgress,
    isUploadingFiles,
    setIsUploadingFiles,
  } = useCreateVideoForm();

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

  const validateAudioFileStep = useCallback(() => {
    console.log("Validate audio ran");
    return !!form.getValues("audioFile");
  }, [form]);

  const validateImageFileStep = useCallback(() => {
    console.log("Validate image ran");
    return !!form.getValues("imageFile");
  }, [form]);

  const validateFinalStep = useCallback(() => {
    console.log("Validate final ran");
    return true;
  }, []);

  const { currentStep, decrement, increment, index, hasNext } =
    useMultistepForm({
      steps: [
        {
          reactNode: (
            <>
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
                        allowedAudioFileSizeBytes={fileSizeQuotaLimitBytes}
                        onDrop={(acceptedFiles) => {
                          field.onChange(acceptedFiles[0]);
                          onAudioFileChange(acceptedFiles[0]);
                        }}
                        onDropAccepted={(audioFile) => {
                          if (!audioFile[0]) return;
                          const objectURL = URL.createObjectURL(audioFile[0]);
                          setAudioObjectURL(objectURL);
                          increment();
                        }}
                      />
                      <FormDescription>
                        The audio file to create the video with.
                      </FormDescription>
                      <FormMessage>
                        {" "}
                        {form.formState?.errors?.audioFile?.message?.toString()}{" "}
                      </FormMessage>
                    </FormItem>
                  </motion.div>
                )}
              />
            </>
          ),
          validateStep: validateAudioFileStep,
        },

        {
          reactNode: (
            <>
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
                    key="2"
                  >
                    <FormItem className="h-[600px]">
                      <ImageFileDropzone
                        imageObjectURL={imageObjectURL}
                        allowedImageFileSizeBytes={MAX_IMAGE_SIZE}
                        imageFileName={imageFile?.name}
                        onDrop={(acceptedFiles) => {
                          field.onChange(acceptedFiles[0]);
                          onImageFileChange(acceptedFiles[0]);
                        }}
                        onDropAccepted={(imageFile) => {
                          const objectURL = URL.createObjectURL(imageFile[0]!);
                          setImageObjectURL(objectURL);
                          increment();
                        }}
                      />
                      <FormDescription>
                        Image to render the video with.
                      </FormDescription>
                      <FormMessage>
                        {" "}
                        {form.formState.errors?.imageFile?.message?.toString()}{" "}
                      </FormMessage>
                    </FormItem>
                  </motion.div>
                )}
              />
            </>
          ),
          validateStep: validateImageFileStep,
        },

        {
          reactNode: (
            <>
              <div className="z-[46] mb-8 w-full space-y-4 rounded-lg border-2 bg-black p-4">
                <FormField
                  control={form.control}
                  name="videoTitle"
                  render={({ field }) => (
                    <motion.div
                      className="z-[47] h-full w-full"
                      initial={{ opacity: 0, x: "-8vw" }}
                      animate={{ opacity: 1, x: "0" }}
                      transition={{
                        type: "just",
                      }}
                      exit={{ opacity: 0 }}
                      key="3"
                    >
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
                    </motion.div>
                  )}
                />

                {/** Preset selection */}
                <motion.div
                  className="z-[47] h-full w-full"
                  initial={{ opacity: 0, x: "-8vw" }}
                  animate={{ opacity: 1, x: "0" }}
                  transition={{
                    type: "just",
                  }}
                  exit={{ opacity: 0 }}
                  key="4"
                >
                  <FormLabel>Video preset</FormLabel>
                  <Select
                    defaultValue="YouTube"
                    onValueChange={(value) => {
                      // Check if the value is a valid preset
                      if (
                        value in CreateVideoFormSchema.shape.videoPreset.enum
                      ) {
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
                </motion.div>

                {/** Upload video section */}
                {/** For now we are just supporting youtube here, we will need to change how this form works to support more*/}
                {uploadVideoFeature && (
                  <motion.div
                    className="flex flex-col space-y-4"
                    initial={{ opacity: 0, x: "-6vw" }}
                    animate={{ opacity: 1, x: "0" }}
                    transition={{
                      type: "just",
                    }}
                    exit={{ opacity: 0 }}
                    key="5"
                  >
                    <div className="flex flex-row gap-4">
                      <FormLabel>Upload video to YouTube?</FormLabel>
                      <Checkbox
                        onCheckedChange={() =>
                          setIsUploadYoutubeVideoChecked(
                            !isUploadYoutubeVideoChecked,
                          )
                        }
                      />
                    </div>

                    {/** Select account to upload to */}

                    {isUploadYoutubeVideoChecked && (
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
                                                  youtubeAccount.channelAvatar ??
                                                  ""
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
                  </motion.div>
                )}

                {/* We are setting isUploading files here due to async nature of the disabled state, kinda hacky*/}
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

                {isUploadingFiles && (
                  <>
                    <div className="flex flex-col gap-4">
                      <p className="mt-2">Uploading files...</p>
                      <div className="flex flex-col gap-2">
                        <Label>Image Upload</Label>
                        <Progress value={uploadImageFileProgress} />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Audio Upload</Label>
                        <Progress value={uploadAudioFileProgress} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ),
          // Since this is the final step, we don't need to validate it as react hook form will do this
          validateStep: validateFinalStep,
        },
      ],
      returnToUrlOnFormExit: "/dashboard",
    });

  // Form submit handler
  async function onSubmit(data: z.infer<typeof CreateVideoFormSchema>) {
    setIsUploadingFiles(true);

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
          setIsUploadingFiles(false);
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

          // Remove the recent operations query so that the new operation is shown
          // We do this because there is an edge case where the first operation created by a user
          // will result in the dummy operation card showing for a few moments before the new data is fetched
          void queryClient.removeQueries({
            queryKey: ["recentOperations"],
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

          // TODO: Move this request setup code into utility function
          if (presignedUrlAudio && audioFileBuffer) {
            const xhr = new XMLHttpRequest();

            xhr.open("PUT", presignedUrlAudio, true);
            xhr.setRequestHeader("Content-Type", audioFile.type);
            xhr.upload.onprogress = (ev) => {
              if (ev.lengthComputable) {
                const percentComplete = (ev.loaded / ev.total) * 100;
                setUploadAudioFileProgress(percentComplete);
                console.log(`%${percentComplete} audio upload`);
              }
            };

            putRequests.push(sendRequest(xhr, audioFileBuffer));
          }

          if (presignedUrlImage && imageFileBuffer) {
            const xhr = new XMLHttpRequest();

            xhr.open("PUT", presignedUrlImage, true);
            xhr.upload.onprogress = (ev) => {
              if (ev.lengthComputable) {
                const percentComplete = (ev.loaded / ev.total) * 100;
                setUploadImageFileProgress(percentComplete);
                console.log(`%${percentComplete} image upload`);
              }
            };

            putRequests.push(sendRequest(xhr, imageFileBuffer));
          }

          // After uploads are complete, redirect the user
          const responses = await Promise.all(putRequests);

          // IF any of the uploads failed, show an error
          if (responses.some((response) => response != 200)) {
            toast({
              title: "Error",
              description: "Failed to upload files",
              variant: "destructive",
            });
            setIsUploadingFiles(false);
            return;
          } else {
            // Don't set isUploadingFiles to false as it will cause the button to be enabled again (and we're about to redirect the user anyway)
            await revalidatePathByServerAction("/dashboard/account");
            router.push(`/dashboard/operation/${data?.operationId}`);
          }
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
    [fileSizeQuotaLimitBytes, form, setAudioFile],
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
    [fileSizeQuotaLimitBytes, form, setImageFile],
  );

  const [currentStepValid, setCurrentStepValid] = useState(false);

  useEffect(() => {
    // Trugger the validation here (when each step changes)
    if (currentStep?.validateStep) {
      setCurrentStepValid(currentStep.validateStep());
    }

    const subscription = form.watch((vals) => {
      console.log(vals, "watched");
      if (currentStep?.validateStep) {
        // TODO: It doesn't seem like our currentStep validate step function is returning false when it should be
        // It runs, but it doesn't seem to be returning the correct value, pretty much just true all the time
        const currentStepValid = currentStep?.validateStep();

        setCurrentStepValid(currentStepValid);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentStep, form, form.watch, index]);

  return (
    <Form {...form}>
      <form
        className="flex h-auto w-auto flex-col items-center px-4"
        onSubmit={form.handleSubmit((data) => {
          const dataToSubmit = {
            audioFile: audioFile!,
            imageFile: imageFile!,
            videoTitle: data.videoTitle,

            // Only include the upload video options if the user has checked the box
            videoPreset: data.videoPreset,
            ...(isUploadYoutubeVideoChecked
              ? { uploadVideoOptions: data.uploadVideoOptions }
              : {}),
          };

          console.log("dataToSubmit", dataToSubmit);

          void onSubmit(dataToSubmit);
        })}
      >
        <div className="z-[50] mb-2 mt-10 flex w-full justify-between">
          <Button type="button" onClick={() => decrement()}>
            Back
          </Button>

          {/* TODO: We are going to need to modify the multistep hook to allow us to determine if the current step has a valid schema */}
          {/* This might involve passing in callbacks for each step that return a boolean value? Basically the button needs to */}
          {/* Be disabled unless the current step has been correctly filled out */}
          <Button
            type="button"
            disabled={!currentStepValid || !hasNext}
            onClick={() => increment()}
          >
            Next
          </Button>
        </div>

        {currentStep?.reactNode ?? <></>}
      </form>
    </Form>
  );
}
