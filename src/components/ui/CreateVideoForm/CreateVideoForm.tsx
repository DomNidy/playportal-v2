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
import { Step, Stepper, useStepper } from "../Stepper";
import UploadAudioFormStep from "./steps/UploadAudioFormStep";
import UploadImageFormStep from "./steps/UploadImageFormStep";
import UploadOptionsFormStep from "./steps/UploadOptionsFormStep";

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

  const router = useRouter();
  const queryClient = useQueryClient();
  const genUploadURL = api.upload.generateUploadURL.useMutation();

  // Form submit handler
  // async function onSubmit(data: z.infer<typeof CreateVideoFormSchema>) {
  //   if (!audioFile) {
  //     toast({
  //       title: "Error",
  //       description: "No audio file was entered.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   const audioFileExtension = getFileExtension(audioFile.name);
  //   const imageFileExtension = imageFile
  //     ? getFileExtension(imageFile?.name)
  //     : null;

  //   // Send request to api to generate a presigned-url so that we can upload the files
  //   genUploadURL.mutate(
  //     {
  //       videoTitle: data.videoTitle,
  //       audioFileContentType: audioFile.type,
  //       audioFileExtension: audioFileExtension,
  //       audioFileSize: audioFile.size,
  //       imageFileContentType: imageFile?.type,
  //       imageFileExtension: imageFileExtension,
  //       imageFileSize: imageFile?.size,
  //       videoPreset: data.videoPreset,
  //       uploadVideoOptions: data.uploadVideoOptions,
  //     },
  //     {
  //       onError(error) {
  //         setIsUploadingFiles(false);
  //         toast({
  //           title: "Error",
  //           description: error.message,
  //           variant: "destructive",
  //         });
  //       },
  //       onSettled: () => {
  //         void queryClient.invalidateQueries({
  //           queryKey: ["userData"],
  //         });

  //         // Remove the recent operations query so that the new operation is shown
  //         // We do this because there is an edge case where the first operation created by a user
  //         // will result in the dummy operation card showing for a few moments before the new data is fetched
  //         void queryClient.removeQueries({
  //           queryKey: ["recentOperations"],
  //         });

  //         void queryClient.invalidateQueries({
  //           queryKey: ["transactions", "getTransaction"],
  //         });
  //       },
  //       async onSuccess(data) {
  //         // Read file data into buffer
  //         const audioFileBuffer = await audioFile.arrayBuffer();
  //         const imageFileBuffer = await imageFile?.arrayBuffer();
  //         // Array of the upload requests
  //         const putRequests = [];

  //         // Read urls from the response
  //         const presignedUrlAudio = data?.presignedUrlAudio;
  //         const presignedUrlImage = data?.presignedUrlImage;

  //         // TODO: Move this request setup code into utility function
  //         if (presignedUrlAudio && audioFileBuffer) {
  //           const xhr = new XMLHttpRequest();

  //           xhr.open("PUT", presignedUrlAudio, true);
  //           xhr.setRequestHeader("Content-Type", audioFile.type);
  //           xhr.upload.onprogress = (ev) => {
  //             if (ev.lengthComputable) {
  //               const percentComplete = (ev.loaded / ev.total) * 100;
  //               setUploadAudioFileProgress(percentComplete);
  //               console.log(`%${percentComplete} audio upload`);
  //             }
  //           };

  //           putRequests.push(sendRequest(xhr, audioFileBuffer));
  //         }

  //         if (presignedUrlImage && imageFileBuffer) {
  //           const xhr = new XMLHttpRequest();

  //           xhr.open("PUT", presignedUrlImage, true);
  //           xhr.upload.onprogress = (ev) => {
  //             if (ev.lengthComputable) {
  //               const percentComplete = (ev.loaded / ev.total) * 100;
  //               setUploadImageFileProgress(percentComplete);
  //               console.log(`%${percentComplete} image upload`);
  //             }
  //           };

  //           putRequests.push(sendRequest(xhr, imageFileBuffer));
  //         }

  //         // After uploads are complete, redirect the user
  //         const responses = await Promise.all(putRequests);

  //         // IF any of the uploads failed, show an error
  //         if (responses.some((response) => response != 200)) {
  //           toast({
  //             title: "Error",
  //             description: "Failed to upload files",
  //             variant: "destructive",
  //           });
  //           setIsUploadingFiles(false);
  //           return;
  //         } else {
  //           // Don't set isUploadingFiles to false as it will cause the button to be enabled again (and we're about to redirect the user anyway)
  //           await revalidatePathByServerAction("/dashboard/account");
  //           router.push(`/dashboard/operation/${data?.operationId}`);
  //         }
  //       },
  //     },
  //   );
  // }

  const steps = [
    {
      label: "Upload Audio",
      description: "Upload the audio file for your video",
    },
    {
      label: "Upload Image",
      description: "Upload the image file for your video",
    },
    {
      label: "Select Video Options",
      description: "Name the video, choose a preset, and select upload options",
    },
  ];

  return (
    <div className="z-[50] flex w-full flex-col gap-4">
      <Stepper
        variant="circle-alt"
        initialStep={0}
        steps={steps}
        className="z-[50]"
      >
        {steps.map((stepProps, index) => {
          if (index === 0) {
            return (
              <Step key={index} {...stepProps} className="z-[50] mt-16">
                <UploadAudioFormStep
                  maxAudioFileSizeBytes={fileSizeQuotaLimitBytes}
                  key={stepProps.label}
                />
              </Step>
            );
          } else if (index === 1) {
            return (
              <Step key={index} {...stepProps}>
                <UploadImageFormStep
                  maxImageFileSizeBytes={MAX_IMAGE_SIZE}
                  key={stepProps.label}
                />
              </Step>
            );
          } else if (index === 2) {
            return (
              <Step key={index} {...stepProps}>
                <UploadOptionsFormStep
                  hasUploadVideoFeature={uploadVideoFeature ?? false}
                  key={stepProps.label}
                />
              </Step>
            );
          }
        })}
      </Stepper>
    </div>
  );
}
