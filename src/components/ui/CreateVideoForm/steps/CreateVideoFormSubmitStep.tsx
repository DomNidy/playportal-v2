"use client";
import React from "react";
import { useCreateVideoForm } from "../CreateVideoFormContext";
import {
  CreateVideoFormSchema,
  type CreateVideoFormUploadAudioSchema,
  type CreateVideoFormUploadImageSchema,
  type CreateVideoFormUploadOptionsSchema,
} from "~/definitions/form-schemas";
import { type z } from "zod";
import { Button } from "../../Button";
import CreateVideoFormActions from "../CreateVideoFormActions";
import { toast } from "../../Toasts/use-toast";
import { api } from "~/trpc/react";
import { getFileExtension, sendRequest } from "~/utils/utils";
import { useQueryClient } from "@tanstack/react-query";
import { revalidatePathByServerAction } from "~/utils/actions";
import { useRouter } from "next/navigation";
import { Label } from "../../Label";
import { Progress } from "../../Progress";
import LoaderStatus from "../../LoaderStatus/LoaderStatus";
import { CirclePlay } from "lucide-react";

export default function CreateVideoFormSubmitStep() {
  const router = useRouter();

  const {
    uploadAudioFormStep,
    uploadImageFormStep,
    uploadVideoOptionsFormStep,
    audioFile,
    imageFile,
  } = useCreateVideoForm();

  const queryClient = useQueryClient();

  // Query used to generate presigned urls for file uploaad
  const genUploadURL = api.upload.generateUploadURL.useMutation();

  // These states are used to show the progress of the file uploads
  const [isUploadingFiles, setIsUploadingFiles] = React.useState(false);
  const [uploadAudioFileProgress, setUploadAudioFileProgress] =
    React.useState(0);
  const [uploadImageFileProgress, setUploadImageFileProgress] =
    React.useState(0);

  // Used to store errors with submitting if any occur
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Utility function that concatenates the form steps into a single object so we can submit the form
  const getConcatenatedFormSteps = (
    uploadAudioFormStep: z.infer<typeof CreateVideoFormUploadAudioSchema>,
    uploadImageFormStep: z.infer<typeof CreateVideoFormUploadImageSchema>,
    uploadVideoOptionsFormStep: z.infer<
      typeof CreateVideoFormUploadOptionsSchema
    >,
  ): z.infer<typeof CreateVideoFormSchema> => {
    if (
      !uploadAudioFormStep ||
      !uploadImageFormStep ||
      !uploadVideoOptionsFormStep
    ) {
      console.error(
        uploadAudioFormStep,
        uploadImageFormStep,
        uploadVideoOptionsFormStep,
      );
      throw new Error("One of the form steps is missing");
    }

    return {
      ...uploadAudioFormStep,
      ...uploadImageFormStep,
      ...uploadVideoOptionsFormStep,
    };
  };

  // Form submit handler
  async function submitCreateVideo(
    data: z.infer<typeof CreateVideoFormSchema>,
  ) {
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
          disabled={isUploadingFiles || genUploadURL.isPending}
          onClick={async () => {
            const concatedSchema = getConcatenatedFormSteps(
              uploadAudioFormStep!,
              uploadImageFormStep!,
              uploadVideoOptionsFormStep!,
            );
            await onSubmit(concatedSchema);
          }}
        >
          <LoaderStatus
            text="Create Video"
            isLoading={isUploadingFiles || genUploadURL.isPending}
            loaderProps={{
              color: "#0C0B0C",
              size: 20,
            }}
          />
        </Button>
      </div>

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
