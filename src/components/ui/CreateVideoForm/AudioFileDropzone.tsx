import { useDropzone, type ErrorCode } from "react-dropzone";
import { toast } from "../Toasts/use-toast";
import { SupportedAudioFileExtensions } from "~/definitions/form-schemas";
import { getFileDropErrorMessage } from "./utils";

export default function AudioFileDropzone({
  onDrop,
  onDropAccepted,
  allowedAudioFileSizeBytes,
  audioFileName,
}: {
  onDrop: (files: File[]) => void;
  onDropAccepted: (files: File[]) => void;
  allowedAudioFileSizeBytes: number;
  audioFileName?: string;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropAccepted,
    accept: {
      "audio/mp3": [".mp3"],
      "audio/wav": [".wav"],
      "audio/ogg": [".ogg"],
    },
    maxFiles: 1,
    maxSize: allowedAudioFileSizeBytes,
    onDropRejected: (files) => {
      const error = getFileDropErrorMessage(
        "audio",
        (files[0]?.errors[0]?.code as ErrorCode) ?? null,
        allowedAudioFileSizeBytes,
        SupportedAudioFileExtensions,
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
      className={`flex w-full h-full  cursor-pointer flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-white border-opacity-15 bg-[#0C0B0C] p-4 ${isDragActive ? "bg-[#171618]" : ""}`}
    >
      <input {...getInputProps()} />
      {audioFileName ? (
        audioFileName
      ) : isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag an audio file here (or click)</p>
      )}
    </div>
  );
}
