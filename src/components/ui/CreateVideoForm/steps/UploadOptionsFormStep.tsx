import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { type z } from "zod";
import CreateVideoFormActions from "../CreateVideoFormActions";
import {
  CreateVideoFormUploadOptionsSchema,
  YoutubeVideoVisibilities,
} from "~/definitions/form-schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../Form";
import { motion } from "framer-motion";
import { Input } from "../../Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Select";
import { VideoPreset } from "~/definitions/api-schemas";
import { Checkbox } from "../../Checkbox";
import MultiSelectFormField from "../../MultiSelect/MultiSelect";
import { useLinkedYoutubeAccounts } from "~/hooks/use-linked-youtube-accounts";
import { Avatar, AvatarFallback, AvatarImage } from "../../Avatar";
import { Button } from "../../Button";
import { Textarea } from "../../Textarea";
import TagsInput from "../TagsInput";
import { useStepper } from "../../Stepper";
import { useCreateVideoForm } from "../CreateVideoFormContext";

export default function UploadOptionsFormStep({
  hasUploadVideoFeature,
}: {
  hasUploadVideoFeature: boolean;
}) {
  const { setUploadVideoOptionsFormStep, uploadVideoOptionsFormStep } =
    useCreateVideoForm();

  const form = useForm<z.infer<typeof CreateVideoFormUploadOptionsSchema>>({
    resolver: zodResolver(CreateVideoFormUploadOptionsSchema),
    defaultValues: {
      videoTitle: uploadVideoOptionsFormStep?.videoTitle ?? "",
      videoPreset:
        uploadVideoOptionsFormStep?.videoPreset ?? VideoPreset.YouTube,
    },
  });
  const { nextStep } = useStepper();

  const {
    data: connectedYoutubeAccounts,
    isLoading: isLoadingYoutubeAccounts,
    isFetching: isFetchingYoutubeAccounts,
    refetch: refetchYoutubeAccounts,
  } = useLinkedYoutubeAccounts();

  const [isUploadYoutubeVideoChecked, setIsUploadYoutubeVideoChecked] =
    React.useState(false);

  const onSubmit = (
    data: z.infer<typeof CreateVideoFormUploadOptionsSchema>,
  ) => {
    setUploadVideoOptionsFormStep(data);
    nextStep();
    console.log("Final step submitted", data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="z-[46] mb-8 w-full space-y-4 rounded-lg border-2 bg-black p-4"
      >
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
                value in
                CreateVideoFormUploadOptionsSchema.shape.videoPreset.enum
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
                CreateVideoFormUploadOptionsSchema.shape.videoPreset.enum,
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
        {hasUploadVideoFeature && (
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
                  setIsUploadYoutubeVideoChecked(!isUploadYoutubeVideoChecked)
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
                                        src={youtubeAccount.channelAvatar ?? ""}
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
                        Comma separated list of tags for the video on YouTube
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
                              <SelectItem key={visibility} value={visibility}>
                                {visibility}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      <FormDescription>
                        The visibility of the video on YouTube, you can change
                        this on YouTube later
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

        {/* We are setting isUploading files here due to async nature of the disabled state, kinda hacky
        <Button
          tabIndex={1}
          type="submit"
          className="mb-4 text-black"
          disabled={
            isUploadingFiles ||
            genUploadURLRequestIsPending ||
            formStateIsSubmitting
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
        )} */}

        <CreateVideoFormActions />
      </form>
    </Form>
  );
}
