import { useDropzone, type ErrorCode } from "react-dropzone";
import { toast } from "../Toasts/use-toast";
import { SupportedImageFileExtensions } from "~/definitions/form-schemas";
import { getFileDropErrorMessage } from "./utils";
import { Button } from "../Button";

export default function ImageFileDropzone({
  onDrop,
  onDropAccepted,
  allowedImageFileSizeBytes,
  imageFileName,
}: {
  onDrop: (files: File[]) => void;
  onDropAccepted: (files: File[]) => void;
  allowedImageFileSizeBytes: number;
  imageFileName?: string;
}) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropAccepted,
    noClick: true,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: allowedImageFileSizeBytes,
    onDropRejected: (files) => {
      const error = getFileDropErrorMessage(
        "image",
        (files[0]?.errors[0]?.code as ErrorCode) ?? null,
        allowedImageFileSizeBytes,
        SupportedImageFileExtensions,
      );

      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`flex h-full w-full flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-white border-opacity-15 bg-[#0C0B0C] p-4 ${isDragActive ? "bg-[#171618]" : ""}`}
    >
      <input {...getInputProps()} />
      {imageFileName ? (
        imageFileName
      ) : isDragActive ? (
        <p className="animate-fade-in text-xl">Drop the audio file here!</p>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl">Drag an image file here </p>
          <p className="text-sm">or...</p>
          <Button type="button" className="w-full" onClick={() => open()}>
            Browse files
          </Button>
        </div>
      )}
    </div>
  );
}
