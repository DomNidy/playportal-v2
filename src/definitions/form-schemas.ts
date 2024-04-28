import { z } from "zod";

// We will validate the files on our aws backend anyway
export const CreateVideoFormSchema = z.object({
  // This will not be the name of the video on youtube, just the internal name
  videoTitle: z
    .string()
    .min(1, "Title must be at least 1 character long")
    .max(100, "Title must be at most 100 characters long"),
  audioFile: z.any().refine(
    (file) => {
      // TODO: Problem, we are receiving the file as a string instead of a File
      const filePath = file as string;
      return filePath.endsWith(".mp3") || filePath.endsWith(".wav");
    },
    {
      message: "Audio file must be a .mp3 or .wav file",
    },
  ),
  imageFile: z
    .any()
    .refine(
      (file) => {
        console.log("Refining image file", file);
        const filePath = file as string;
        return (
          filePath.endsWith(".png") ||
          filePath.endsWith(".jpg") ||
          filePath.endsWith(".jpeg") ||
          filePath.endsWith(".webp") ||
          filePath == null ||
          filePath == ""
        );
      },
      {
        message: "Must be a file with a valid image extension",
      },
    )
    .optional()
    .nullish(),
});
