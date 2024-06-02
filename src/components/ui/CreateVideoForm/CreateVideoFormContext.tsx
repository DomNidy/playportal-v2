"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, createContext, useContext, useEffect } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { type z } from "zod";
import { type VideoPreset } from "~/definitions/api-schemas";
import { CreateVideoFormSchema } from "~/definitions/form-schemas";

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

  form: UseFormReturn<z.infer<typeof CreateVideoFormSchema>>;
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

  const form = useForm({
    resolver: zodResolver(CreateVideoFormSchema),
    defaultValues: {
      videoTitle: "My video",
      audioFile: audioFile ?? "",
      imageFile: imageFile ?? "",
      videoPreset: "YouTube" as keyof typeof VideoPreset,
    } as z.infer<typeof CreateVideoFormSchema>,
  });

  return (
    <CreateVideoFormContext.Provider
      value={{
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
        form,
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
