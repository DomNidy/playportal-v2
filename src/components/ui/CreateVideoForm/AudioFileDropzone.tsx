import { useDropzone, type ErrorCode } from "react-dropzone";
import { toast } from "../Toasts/use-toast";
import { SupportedAudioFileExtensions } from "~/definitions/form-schemas";
import { getFileDropErrorMessage } from "./utils";
import { Button } from "../Button";
import { AudioLines, UploadIcon } from "lucide-react";
import { Label } from "../Label";

export default function AudioFileDropzone({
  onDrop,
  onDropAccepted,
  allowedAudioFileSizeBytes,
  audioFileName,
  audioObjectURL,
  onAudioFileRemoved,
}: {
  onDrop: (files: File[]) => void;
  onDropAccepted: (files: File[]) => void;
  allowedAudioFileSizeBytes: number;
  audioFileName?: string;
  audioObjectURL: string | null;
  onAudioFileRemoved: () => void;
}) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = useDropzone({
    onDrop,
    noClick: true,
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
    <div className="flex flex-col space-y-8">
      <div
        {...getRootProps()}
        onClick={() => open()}
        data-state={
          isDragActive
            ? "active"
            : isDragAccept
              ? "accept"
              : isDragReject
                ? "reject"
                : undefined
        }
        className={`cusor-pointer group dark relative grid h-52 w-full cursor-pointer 
            place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 
            bg-[#0C0B0C] px-5 py-4 text-center text-muted-foreground ring-offset-background transition 
             hover:bg-[#171618] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
             focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[state=active]:border-muted-foreground/50
             data-[disabled]:opacity-50`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-full border border-dashed p-3">
              <UploadIcon
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="animate-fade-in text-lg font-semibold">
              Drop the audio file here!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-full border border-dashed p-3">
              <UploadIcon
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-lg font-semibold">
              Drag an audio file here{" "}
            </p>
            <p className="text-sm">
              You can also click anywhere to browse your files.
            </p>
          </div>
        )}
      </div>

      <div className="w-full rounded-lg border-[1.5px] border-muted-foreground/25 bg-[#0C0B0C] p-4">
        <Label className="my-2 text-lg">Uploaded Audio File</Label>
        <div className="w-full rounded-lg border-[1.5px] border-muted-foreground/25 bg-[#0C0B0C] py-2">
          {audioFileName ? (
            <div className="flex flex-col items-start justify-between gap-2 px-4 py-2 sm:flex-row sm:items-center">
              <p className="max-w-fit overflow-hidden text-ellipsis whitespace-normal text-nowrap text-muted-foreground  ">
                {audioFileName}
              </p>

              {audioObjectURL && (
                <audio src={audioObjectURL} controls className="w-full">
                  Your audio
                </audio>
              )}
              <Button
                type="button"
                className="w-full sm:w-auto"
                variant="destructive"
                onClick={onAudioFileRemoved}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 p-4">
              <div className="rounded-full border border-dashed p-3">
                <AudioLines
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h2 className="mt-2 text-lg font-semibold text-white">
                No audio file uploaded
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload an audio file to continue
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
