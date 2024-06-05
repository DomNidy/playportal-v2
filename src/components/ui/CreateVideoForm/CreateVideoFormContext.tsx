"use client";
import { useState, createContext, useContext } from "react";
import { type z } from "zod";
import type {
  CreateVideoFormUploadAudioSchema,
  CreateVideoFormUploadImageSchema,
  CreateVideoFormUploadOptionsSchema,
} from "~/definitions/form-schemas";

export type CreateVideoFormCTX = {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;

  imageFile: File | null;
  setImageFile: (file: File | null) => void;

  audioObjectURL: string | null;
  setAudioObjectURL: (url: string | null) => void;

  imageObjectURL: string | null;
  setImageObjectURL: (url: string | null) => void;

  isUploadYoutubeVideoChecked: boolean;
  setIsUploadYoutubeVideoChecked: (checked: boolean) => void;

  uploadAudioFileProgress: number | null;
  setUploadAudioFileProgress: (progress: number | null) => void;

  uploadImageFileProgress: number | null;
  setUploadImageFileProgress: (progress: number | null) => void;

  isUploadingFiles: boolean;
  setIsUploadingFiles: (isUploading: boolean) => void;

  // Stores the state of the upload audio form step
  uploadAudioFormStep: z.infer<typeof CreateVideoFormUploadAudioSchema> | null;
  setUploadAudioFormStep: (
    step: z.infer<typeof CreateVideoFormUploadAudioSchema> | null,
  ) => void;

  // Stores the state of the upload image form step
  uploadImageFormStep: z.infer<typeof CreateVideoFormUploadImageSchema> | null;
  setUploadImageFormStep: (
    step: z.infer<typeof CreateVideoFormUploadImageSchema> | null,
  ) => void;

  // Stores the state of the upload video options form step
  uploadVideoOptionsFormStep: z.infer<
    typeof CreateVideoFormUploadOptionsSchema
  > | null;
  setUploadVideoOptionsFormStep: (
    step: z.infer<typeof CreateVideoFormUploadOptionsSchema> | null,
  ) => void;
};

const CreateVideoFormContext = createContext<CreateVideoFormCTX | undefined>(
  undefined,
);

export function CreateVideoFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioObjectURL, setAudioObjectURL] = useState<string | null>(null);
  const [imageObjectURL, setImageObjectURL] = useState<string | null>(null);

  const [uploadAudioFileProgress, setUploadAudioFileProgress] = useState<
    number | null
  >(null);
  const [uploadImageFileProgress, setUploadImageFileProgress] = useState<
    number | null
  >(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);

  // Is the upload video section toggled (with checkbox)
  const [isUploadYoutubeVideoChecked, setIsUploadYoutubeVideoChecked] =
    useState<boolean>(false);

  // Form step states:

  const [uploadAudioFormStep, setUploadAudioFormStep] = useState<z.infer<
    typeof CreateVideoFormUploadAudioSchema
  > | null>(null);

  const [uploadImageFormStep, setUploadImageFormStep] = useState<z.infer<
    typeof CreateVideoFormUploadImageSchema
  > | null>(null);

  const [uploadVideoOptionsFormStep, setUploadVideoOptionsFormStep] =
    useState<z.infer<typeof CreateVideoFormUploadOptionsSchema> | null>(null);

  return (
    <CreateVideoFormContext.Provider
      value={{
        uploadVideoOptionsFormStep,
        setUploadVideoOptionsFormStep,
        uploadImageFormStep,
        setUploadImageFormStep,
        uploadAudioFormStep,
        setUploadAudioFormStep,
        audioFile,
        setAudioFile,
        setImageObjectURL,
        audioObjectURL,
        setAudioObjectURL,
        imageObjectURL,
        setImageFile,
        imageFile,
        isUploadYoutubeVideoChecked,
        setIsUploadYoutubeVideoChecked,
        uploadAudioFileProgress,
        setUploadAudioFileProgress,
        uploadImageFileProgress,
        setUploadImageFileProgress,
        isUploadingFiles,
        setIsUploadingFiles,
      }}
    >
      {children}
    </CreateVideoFormContext.Provider>
  );
}

export function useCreateVideoForm() {
  const context = useContext(CreateVideoFormContext);
  if (!context) {
    throw new Error(
      "useCreateVideoForm must be used within a CreateVideoFormProvider",
    );
  }

  return context;
}
