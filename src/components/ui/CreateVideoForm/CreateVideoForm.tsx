"use client";
import React, { useEffect } from "react";
import posthog from "posthog-js";
import { Step, Stepper } from "../Stepper";
import UploadAudioFormStep from "./steps/UploadAudioFormStep";
import UploadImageFormStep from "./steps/UploadImageFormStep";
import UploadOptionsFormStep from "./steps/UploadOptionsFormStep";
import CreateVideoFormSubmitStep from "./steps/CreateVideoFormSubmitStep";
import TextOverlayOptionsFormStep from "./steps/TextOverlayOptionsFormStep";

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
    {
      label: "Text Overlay",
      description: "Configure text overlay",
    },
    {
      label: "Finalize and Submit",
      description:
        "Does everything look good? Submit and we'll create your video.",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <Stepper
        variant="circle-alt"
        initialStep={0}
        steps={steps}
        className="z-[50] px-4"
      >
        {steps.map((stepProps, index) => {
          if (index === 0) {
            return (
              <Step key={index} {...stepProps} className="z-[50]">
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
          } else if (index === 3) {
            return (
              <Step key={index} {...stepProps} className="mt-16">
                <TextOverlayOptionsFormStep />
              </Step>
            );
          } else if (index === 4) {
            return (
              <Step key={index} {...stepProps} className="mt-16">
                <CreateVideoFormSubmitStep />
              </Step>
            );
          }
        })}
      </Stepper>
    </div>
  );
}
