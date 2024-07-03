import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo } from "react";
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
import MultiSelectFormField, {
  type MultiSelectFormFieldOption,
} from "../../MultiSelect/MultiSelect";
import { useLinkedYoutubeAccounts } from "~/hooks/use-linked-youtube-accounts";
import { Button } from "../../Button";
import { Textarea } from "../../Textarea";
import TagsInput from "../TagsInput";
import { useStepper } from "../../Stepper";
import { useCreateVideoForm } from "../CreateVideoFormContext";
import SubmitStatus from "../../LoaderStatus/LoaderStatus";
import { Link } from "~/components/ui/Link";
import { Link2Icon } from "lucide-react";
import { YoutubeChannelAvatar } from "../YoutubeChannelAvatar";
import TitleBuilder from "../../TitleBuilder";
import TagGenerator from "../../TagGenerator";
import DescriptionTemplate from "../../DescriptionTemplate";

function isString(v: unknown): v is string {
  return typeof v === "string";
}

export default function UploadOptionsFormStep({
  hasUploadVideoFeature,
}: {
  hasUploadVideoFeature: boolean;
}) {
  const {
    setUploadVideoOptionsFormStep,
    uploadVideoOptionsFormStep,
    isUploadYoutubeVideoChecked,
    setIsUploadYoutubeVideoChecked,
  } = useCreateVideoForm();

  const form = useForm<z.infer<typeof CreateVideoFormUploadOptionsSchema>>({
    resolver: zodResolver(CreateVideoFormUploadOptionsSchema),
    defaultValues: {
      videoTitle: uploadVideoOptionsFormStep?.videoTitle ?? "",
      videoPreset:
        uploadVideoOptionsFormStep?.videoPreset ?? VideoPreset.YouTube,
    },
    values: {
      videoTitle: uploadVideoOptionsFormStep?.videoTitle ?? "",
      videoPreset:
        uploadVideoOptionsFormStep?.videoPreset ?? VideoPreset.YouTube,

      uploadVideoOptions: isUploadYoutubeVideoChecked
        ? {
            ...uploadVideoOptionsFormStep?.uploadVideoOptions,
            youtube: {
              videoTitle:
                uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube
                  ?.videoTitle ??
                uploadVideoOptionsFormStep?.videoTitle ??
                "",
              videoDescription:
                uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube
                  ?.videoDescription ?? "",
              videoVisibility:
                uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube
                  ?.videoVisibility ?? YoutubeVideoVisibilities.Unlisted,
              uploadToChannels:
                uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube?.uploadToChannels?.filter(
                  isString,
                ) ?? [],
              videoTags:
                uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube?.videoTags?.filter(
                  isString,
                ) ?? [],
            },
          }
        : undefined,
    },
  });
  const { nextStep } = useStepper();

  const {
    data: connectedYoutubeAccounts,
    isLoading: isLoadingYoutubeAccounts,
    isFetching: isFetchingYoutubeAccounts,
    refetch: refetchYoutubeAccounts,
  } = useLinkedYoutubeAccounts();

  // We memoize the props for the MultiSelectFormField to prevent unnecessary re-renders as it would run this map
  // every time the form re-renders otherwise.
  const youtubeChannelOptions = useMemo(() => {
    console.log("Recomputed youtubeChannelOptions");

    const connectedAccounts: MultiSelectFormFieldOption[] =
      connectedYoutubeAccounts
        ? connectedYoutubeAccounts.map((youtubeAccount, idx) => ({
            label: youtubeAccount.channelTitle,
            value: youtubeAccount.channelId,
            // TODO: Figure out why the image is sometimes not showing on re-renders
            icon: () => {
              return (
                <YoutubeChannelAvatar
                  key={idx}
                  channelTitle={youtubeAccount.channelTitle}
                  channelAvatar={youtubeAccount.channelAvatar}
                />
              );
            },
          }))
        : [];

    return connectedAccounts;
  }, [connectedYoutubeAccounts]);

  const onSubmit = (
    data: z.infer<typeof CreateVideoFormUploadOptionsSchema>,
  ) => {
    setUploadVideoOptionsFormStep(data);
    nextStep();
  };

  //* Title builder
  const onTitleBuilderSubmit = (title: string, beatName: string) => {
    setUploadVideoOptionsFormStep((prev) => ({
      ...prev,
      videoTitle: beatName,
      uploadVideoOptions: {
        youtube: {
          videoTitle: title,
        },
      },
    }));

    setTitleBuilderOpen(false);
  };
  const [titleBuilderOpen, setTitleBuilderOpen] = React.useState(false);

  //* Tag generator
  const onTagGeneratorSubmit = (newTags: string[]) => {
    setUploadVideoOptionsFormStep((prev) => ({
      ...prev,
      uploadVideoOptions: {
        ...prev?.uploadVideoOptions,
        youtube: {
          ...prev?.uploadVideoOptions?.youtube,
          videoTags: newTags,
        },
      },
    }));
  };

  const [tagGeneratorOpen, setTagGeneratorOpen] = React.useState(false);

  //* Description template
  const onDescriptionTemplateSubmit = (newDescription: string) => {
    setUploadVideoOptionsFormStep((prev) => ({
      ...prev,
      uploadVideoOptions: {
        ...prev?.uploadVideoOptions,
        youtube: {
          ...prev?.uploadVideoOptions?.youtube,
          videoDescription: newDescription,
        },
      },
    }));
  };

  const [descriptionTemplateOpen, setDescriptionTemplateOpen] =
    React.useState(false);

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
                <FormLabel>Beat Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My video"
                    {...field}
                    onChange={(v) => {
                      field.onChange(v);

                      setUploadVideoOptionsFormStep((prev) => ({
                        ...prev,
                        videoTitle: v.target.value,
                      }));
                    }}
                  />
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
          <FormLabel className="py-2">Aspect Ratio</FormLabel>
          <Select
            defaultValue="YouTube"
            value={uploadVideoOptionsFormStep?.videoPreset ?? "YouTube"}
            onValueChange={(value) => {
              // Check if the value is a valid preset
              if (
                value in
                CreateVideoFormUploadOptionsSchema.shape.videoPreset.enum
              ) {
                form.setValue("videoPreset", value as VideoPreset);
                setUploadVideoOptionsFormStep((prev) => ({
                  ...prev,
                  videoPreset: value as VideoPreset,
                }));
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
            <div className="flex flex-row items-center gap-4">
              <FormLabel className="text-lg">
                Upload video to YouTube?
              </FormLabel>
              <Checkbox
                checked={isUploadYoutubeVideoChecked}
                onCheckedChange={() =>
                  setIsUploadYoutubeVideoChecked(!isUploadYoutubeVideoChecked)
                }
              />
            </div>

            {/** Select account to upload to */}

            {isUploadYoutubeVideoChecked && (
              <>
                <FormField
                  control={form.control}
                  shouldUnregister={true}
                  defaultValue={uploadVideoOptionsFormStep?.videoTitle ?? ""}
                  name="uploadVideoOptions.youtube.videoTitle"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>YouTube Video Title</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2 md:flex-row">
                          <Input
                            placeholder="My video"
                            {...field}
                            onChange={(v) => {
                              field.onChange(v);
                              setUploadVideoOptionsFormStep((prev) => ({
                                ...prev,
                                uploadVideoOptions: {
                                  ...prev?.uploadVideoOptions,
                                  youtube: {
                                    ...prev?.uploadVideoOptions?.youtube,
                                    videoTitle: v.target.value,
                                  },
                                },
                              }));
                            }}
                          />

                          <TitleBuilder
                            defaultBeatName={
                              uploadVideoOptionsFormStep?.videoTitle
                            }
                            modalOpen={titleBuilderOpen}
                            onModalOpenChange={setTitleBuilderOpen}
                            setTitleCallback={onTitleBuilderSubmit}
                            triggerButton={
                              <Button className="min-w-64  md:self-end">
                                Title Builder
                              </Button>
                            }
                          />
                        </div>
                      </FormControl>

                      <FormMessage>
                        {form.formState.errors?.uploadVideoOptions?.youtube?.videoTitle?.message?.toString()}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormDescription>
                  The title of the video on YouTube
                </FormDescription>
                <FormField
                  control={form.control}
                  shouldUnregister={true}
                  defaultValue={""}
                  name="uploadVideoOptions.youtube.videoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video Description</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2 md:flex-row ">
                          <Textarea
                            maxLength={5000}
                            placeholder="My video description"
                            {...field}
                            onChange={(v) => {
                              field.onChange(v);
                              setUploadVideoOptionsFormStep((prev) => ({
                                ...prev,
                                uploadVideoOptions: {
                                  ...prev?.uploadVideoOptions,
                                  youtube: {
                                    ...prev?.uploadVideoOptions?.youtube,
                                    videoDescription: v.target.value,
                                  },
                                },
                              }));
                            }}
                          />

                          <FormMessage>
                            {form.formState.errors?.uploadVideoOptions?.youtube?.videoDescription?.message?.toString()}
                          </FormMessage>
                          <DescriptionTemplate
                            modalOpen={descriptionTemplateOpen}
                            onModalOpenChange={setDescriptionTemplateOpen}
                            setDescriptionCallback={onDescriptionTemplateSubmit}
                            triggerButton={
                              <Button className="min-w-64   md:self-start">
                                Description Template
                              </Button>
                            }
                          />
                        </div>
                      </FormControl>

                      <FormMessage>
                        {form.formState.errors?.uploadVideoOptions?.youtube?.videoDescription?.message?.toString()}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormDescription>
                  The description of the video on YouTube
                </FormDescription>

                <FormField
                  control={form.control}
                  shouldUnregister={true}
                  defaultValue={
                    uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube?.videoTags?.filter(
                      isString,
                    ) ?? []
                  }
                  name="uploadVideoOptions.youtube.videoTags"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>YouTube Video Tags</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2 md:flex-row ">
                          <TagsInput
                            initialKeywords={
                              form.getValues(
                                "uploadVideoOptions.youtube.videoTags",
                              ) ??
                              uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube?.videoTags?.filter(
                                isString,
                              ) ??
                              []
                            }
                            controllerRenderProps={{
                              name: field.name,
                              ref: field.ref,
                              onBlur: field.onBlur,
                              onChange: field.onChange,
                              disabled: field.disabled,
                              // We don't need to set the value here since the TagsInput component will handle that
                              value: field.value,
                            }}
                            onKeywordsChange={(keywords) => {
                              field.onChange(keywords);

                              setUploadVideoOptionsFormStep((prev) => ({
                                ...prev,
                                uploadVideoOptions: {
                                  ...prev?.uploadVideoOptions,
                                  youtube: {
                                    ...prev?.uploadVideoOptions?.youtube,
                                    videoTags: keywords,
                                  },
                                },
                              }));
                            }}
                          />

                          <TagGenerator
                            defaultTagQuery={
                              (
                                form.getValues(
                                  "uploadVideoOptions.youtube.videoTitle",
                                ) ?? ""
                              ).replace(/"[^"]*"| - /g, "") ?? ""
                            }
                            modalOpen={tagGeneratorOpen}
                            onModalOpenChange={setTagGeneratorOpen}
                            setTagsCallback={onTagGeneratorSubmit}
                            triggerButton={
                              <Button className="min-w-64  md:self-start">
                                Open Tag Generator
                              </Button>
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors?.uploadVideoOptions?.youtube?.videoTags?.message?.toString()}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormDescription>
                  Comma separated list of tags for the video on YouTube
                </FormDescription>

                <div className="flex flex-col space-y-2">
                  <FormLabel>Upload to this YouTube Channel</FormLabel>

                  <div className="dark flex flex-col gap-2 md:flex-row">
                    <Controller
                      control={form.control}
                      shouldUnregister={true}
                      name="uploadVideoOptions.youtube.uploadToChannels"
                      render={({ field }) => (
                        <>
                          <MultiSelectFormField
                            value={field.value}
                            isDataLoading={isLoadingYoutubeAccounts}
                            loadingPlaceholder={
                              <p className="text-center text-white">
                                Loading...
                              </p>
                            }
                            onValueChange={(v) => {
                              setUploadVideoOptionsFormStep((prev) => ({
                                ...prev,
                                uploadVideoOptions: {
                                  ...prev?.uploadVideoOptions,
                                  youtube: {
                                    ...prev?.uploadVideoOptions?.youtube,
                                    uploadToChannels: v,
                                  },
                                },
                              }));
                              field.onChange(v);
                            }}
                            options={youtubeChannelOptions}
                            defaultValue={field.value}
                            placeholder="Select a channel"
                          />
                        </>
                      )}
                    />

                    <Link
                      className="w-fit"
                      href="/dashboard/account"
                      variant={"button"}
                      passHref
                      legacyBehavior
                    >
                      <a
                        target="_blank"
                        className={
                          "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        }
                      >
                        <Link2Icon size={20} /> Link a YouTube Channel
                      </a>
                    </Link>

                    <Button
                      className=""
                      type="button"
                      disabled={isFetchingYoutubeAccounts}
                      onClick={() => {
                        void refetchYoutubeAccounts();
                      }}
                    >
                      <SubmitStatus
                        text="Refresh linked channels"
                        isLoading={isFetchingYoutubeAccounts}
                        loaderProps={{ size: 12 }}
                      />
                    </Button>
                  </div>

                  <FormMessage>
                    {" "}
                    {form?.formState?.errors?.uploadVideoOptions?.youtube?.uploadToChannels?.message?.toString()}{" "}
                  </FormMessage>
                </div>

                <Controller
                  control={form.control}
                  shouldUnregister={true}
                  defaultValue={
                    uploadVideoOptionsFormStep?.uploadVideoOptions?.youtube
                      ?.videoVisibility
                  }
                  name="uploadVideoOptions.youtube.videoVisibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Visibility</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);

                          // Ensure that the value is a valid visibility
                          const valToVis =
                            value in YoutubeVideoVisibilities
                              ? (value as YoutubeVideoVisibilities)
                              : YoutubeVideoVisibilities.Unlisted;

                          setUploadVideoOptionsFormStep((prev) => ({
                            ...prev,
                            uploadVideoOptions: {
                              ...prev?.uploadVideoOptions,
                              youtube: {
                                ...prev?.uploadVideoOptions?.youtube,
                                videoVisibility: valToVis,
                              },
                            },
                          }));
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

        <CreateVideoFormActions />
      </form>
    </Form>
  );
}
