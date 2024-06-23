"use client";
import React from "react";
import { useCreateVideoForm } from "../CreateVideoFormContext";
import { CreateVideoFormSchema } from "~/definitions/form-schemas";
import { type z } from "zod";
import { Button } from "../../Button";
import CreateVideoFormActions from "../CreateVideoFormActions";
import { toast } from "../../Toasts/use-toast";
import { getFileExtension } from "~/utils/utils";
import { Label } from "../../Label";
import { Progress } from "../../Progress";
import LoaderStatus from "../../LoaderStatus/LoaderStatus";
import { CirclePlay } from "lucide-react";

export default function CreateVideoFormSubmitStep() {
  const {
    uploadAudioFormStep,
    uploadImageFormStep,
    uploadVideoOptionsFormStep,
    audioFile,
    isUploadingFiles,
    setIsUploadingFiles,
    uploadAudioFileProgress,
    uploadImageFileProgress,
    imageFile,
    genUploadURLMutation,
    textOverlayFormStep,
  } = useCreateVideoForm();

  // Used to store errors with submitting if any occur
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Utility function that concatenates the form steps into a single object so we can submit the form
  const getConcatenatedFormSteps = (
    uploadAudioFormStep: unknown,
    uploadImageFormStep: unknown,
    uploadVideoOptionsFormStep: unknown,
    textOverlayFormStep: unknown,
  ): unknown => {
    if (
      !uploadAudioFormStep ||
      !uploadImageFormStep ||
      !uploadVideoOptionsFormStep ||
      !textOverlayFormStep
    ) {
      console.error(
        uploadAudioFormStep,
        uploadImageFormStep,
        uploadVideoOptionsFormStep,
        textOverlayFormStep,
      );
      throw new Error("One of the form steps is missing");
    }

    return {
      ...uploadAudioFormStep,
      ...uploadImageFormStep,
      ...uploadVideoOptionsFormStep,
      textOverlay: textOverlayFormStep,
    };
  };

  // Form submit handler
  async function submitCreateVideo(
    data: z.infer<typeof CreateVideoFormSchema>,
  ) {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "Could not find audio file to upload, please try again.",
        variant: "destructive",
      });
      return;
    }

    const audioFileExtension = getFileExtension(audioFile.name);
    const imageFileExtension = imageFile
      ? getFileExtension(imageFile?.name)
      : null;

    // Send request to api to generate a presigned-url so that we can upload the files
    genUploadURLMutation.mutate({
      videoTitle: data.videoTitle,
      audioFileContentType: audioFile.type,
      audioFileExtension: audioFileExtension,
      audioFileSize: audioFile.size,
      imageFileContentType: imageFile?.type,
      imageFileExtension: imageFileExtension,
      imageFileSize: imageFile?.size,
      videoPreset: data.videoPreset,
      uploadVideoOptions: data.uploadVideoOptions,
      textOverlay: data.textOverlay,
    });
  }

  // TODO: In the future, if the schema does not parse correctly, we should direct the user to the first step that has an error
  const onSubmit = async (data: z.infer<typeof CreateVideoFormSchema>) => {
    setIsUploadingFiles(true);
    console.log("Create video form submit called with form data", data);
    // Ensure that the schema is actually valid (since getConcatenatedFormSteps doesn't check the schema, it just uses a type assertion)
    const res = CreateVideoFormSchema.safeParse(data);
    if (!res.success) {
      // The user should not be able to be at this step with invalid form data, but just incase they do, we should show an error
      setSubmitError(
        "Invalid video settings, please try again or contact support.",
      );
      console.error("Create video form schema is invalid", res.error);
      return;
    }

    console.log("Create video form schema is valid, submitting...");

    await submitCreateVideo(data);
  };

  return (
    <div className="relative z-[50] flex h-full w-full flex-col items-center justify-center rounded-lg border-[1.5px] border-opacity-5 bg-[#0C0B0C] p-4">
      <div className="flex flex-col items-center gap-1 p-4">
        <div className="rounded-full border border-dashed p-3">
          <CirclePlay
            className="size-7 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <h2 className="mt-2 text-lg font-semibold text-white">
          Ready to create?
        </h2>
        <p className="text-sm text-muted-foreground">
          Click the button below and we will begin creating your video!
        </p>
        <Button
          className="mt-2"
          disabled={isUploadingFiles || genUploadURLMutation.isPending}
          onClick={async () => {
            const concatedSchema = getConcatenatedFormSteps(
              uploadAudioFormStep!,
              uploadImageFormStep!,
              uploadVideoOptionsFormStep!,
              textOverlayFormStep!,
            );

            console.log(
              "Concated schema",
              concatedSchema,
              "textOverlayFormStep",
              textOverlayFormStep,
            );

            const validateSchema =
              CreateVideoFormSchema.safeParse(concatedSchema);

            if (!validateSchema.success) {
              setSubmitError(
                "Invalid video settings, please try again or contact support.",
              );
              console.error(
                "Create video form schema is invalid",
                validateSchema.error,
              );
              return;
            }

            console.log(
              "Create video form schema is valid:",
              validateSchema.data,
            );

            await onSubmit(validateSchema.data);
          }}
        >
          <LoaderStatus
            text="Create Video"
            isLoading={isUploadingFiles || genUploadURLMutation.isPending}
            loaderProps={{
              color: "#0C0B0C",
              size: 20,
            }}
          />
        </Button>
      </div>

      <p>{JSON.stringify(textOverlayFormStep)}</p>

      {submitError && <p>{submitError}</p>}

      {isUploadingFiles && (
        <>
          <div className="flex w-full flex-col gap-4">
            <p className="mt-2 font-semibold">Uploading files...</p>
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
      <CreateVideoFormActions />
    </div>
  );
}
