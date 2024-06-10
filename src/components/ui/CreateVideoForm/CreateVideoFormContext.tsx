"use client";
import React, {
  useState,
  createContext,
  useContext,
  type SetStateAction,
} from "react";
import { type z } from "zod";
import type {
  CreateVideoFormUploadAudioSchema,
  CreateVideoFormUploadImageSchema,
  CreateVideoFormUploadOptionsSchema,
} from "~/definitions/form-schemas";
import { api } from "~/trpc/react";
import { toast } from "../Toasts/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { sendRequest } from "~/utils/utils";
import { useRouter } from "next/navigation";
import { type DeepPartial } from "react-hook-form";
import { revalidatePathByServerAction } from "~/server/actions";

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
  setUploadAudioFormStep: React.Dispatch<
    SetStateAction<z.infer<typeof CreateVideoFormUploadAudioSchema> | null>
  >;

  // Stores the state of the upload image form step
  uploadImageFormStep: z.infer<typeof CreateVideoFormUploadImageSchema> | null;
  setUploadImageFormStep: React.Dispatch<
    SetStateAction<z.infer<typeof CreateVideoFormUploadImageSchema> | null>
  >;

  // These are marked with partial because some fields like youtube related fields are optional
  // Stores the state of the upload video options form step
  uploadVideoOptionsFormStep: DeepPartial<
    z.infer<typeof CreateVideoFormUploadOptionsSchema>
  > | null;
  setUploadVideoOptionsFormStep: React.Dispatch<
    SetStateAction<DeepPartial<
      z.infer<typeof CreateVideoFormUploadOptionsSchema>
    > | null>
  >;

  genUploadURLMutation: ReturnType<
    typeof api.upload.generateUploadURL.useMutation
  >;
};

const CreateVideoFormContext = createContext<CreateVideoFormCTX | undefined>(
  undefined,
);

export function CreateVideoFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const router = useRouter();
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
    useState<DeepPartial<
      z.infer<typeof CreateVideoFormUploadOptionsSchema>
    > | null>(null);

  // Query used to generate presigned urls for file uploaad
  const genUploadURL = api.upload.generateUploadURL.useMutation({
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
      if (!audioFile) {
        toast({
          title: "Error",
          description: "No audio file was entered.",
          variant: "destructive",
        });
        return;
      }

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
  });

  return (
    <CreateVideoFormContext.Provider
      value={{
        genUploadURLMutation: genUploadURL,
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
