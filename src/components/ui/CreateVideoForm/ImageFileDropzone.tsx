import { useDropzone, type ErrorCode } from "react-dropzone";
import { toast } from "../Toasts/use-toast";
import { SupportedImageFileExtensions } from "~/definitions/form-schemas";
import { getFileDropErrorMessage } from "./utils";

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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropAccepted,
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
      className={`flex h-[65vh] cursor-pointer flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-white border-opacity-15 bg-[#0C0B0C] p-4 ${isDragActive ? "bg-[#171618]" : ""}`}
    >
      <input {...getInputProps()} />
      {imageFileName ? (
        imageFileName
      ) : isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag an image file here (or click)</p>
      )}
    </div>
  );
}
