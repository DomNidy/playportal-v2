import { useDropzone, ErrorCode } from "react-dropzone";
import { toast } from "../Toasts/use-toast";

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
      const error =
        files[0]?.errors[0]?.code === ErrorCode.FileTooLarge
          ? `File size exceeds your plan's limit of ${(allowedImageFileSizeBytes / 1024 / 1024).toFixed(2)} MB`
          : files[0]?.errors[0]?.message;

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
      className={`rounded-lg border-[1.5px] border-white border-opacity-15 bg-[#0C0B0C] p-4 ${isDragActive ? "bg-[#171618]" : ""}`}
    >
      <input {...getInputProps()} />
      {imageFileName ? (
        imageFileName
      ) : isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag an image file here</p>
      )}
    </div>
  );
}
