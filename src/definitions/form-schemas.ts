import { z } from "zod";
import { VideoPreset } from "./api-schemas";

export const ResetPasswordFormSchema = z.object({
  email: z.string().email(),
});

export const UpdatePasswordFormSchema = z
  .object({
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match.",
  });

export enum YoutubeVideoVisibilities {
  Public = "Public",
  Unlisted = "Unlisted",
  Private = "Private",
}

// We will validate the files on our aws backend anyway
export const CreateVideoFormSchema = z.object({
  // This will not be the name of the video on youtube, just the internal name
  videoTitle: z
    .string()
    .min(1, "Title must be at least 1 character long")
    .max(100, "Title must be at most 100 characters long"),
  audioFile: z.any().refine(
    (file: File) => {
      if (!file) {
        return false;
      }

      // TODO: Problem, we are receiving the file as a string instead of a File
      return file.name.endsWith(".mp3") || file.name.endsWith(".wav");
    },
    {
      message: "Audio file must be a .mp3 or .wav file",
    },
  ),
  imageFile: z
    .any()
    .refine(
      (file: File) => {
        const filePath = file.name;

        if (!filePath) {
          return false;
        }

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
  videoPreset: z.nativeEnum(VideoPreset),
  uploadVideoOptions: z
    .object({
      youtube: z
        .object({
          videoTitle: z
            .string()
            .min(1)
            .max(100, "Title must be at most 100 characters long"),
          videoDescription: z
            .string()
            .max(5000, "Description may be no longer than 5000 characters.")
            .optional(),
          videoTags: z
            .array(z.string())
            .refine((tags) => {
              console.log(tags.join("").length);
              return tags.join("").length <= 500;
            }, "Tags must be at most 500 characters long.")
            .optional(),
          // An array of the channel ids that the video should be uploaded to
          // We will use this as a mapping to the oauth tokens in the db
          uploadToChannels: z
            .array(z.string(), {
              message: "Please select at least one channel to upload to.",
            })
            .min(1, {
              message: "Please select at least one channel to upload to.",
            }),
          videoVisibility: z.nativeEnum(YoutubeVideoVisibilities, {
            message: "Please select a visibility setting for the video.",
          }),
        })
        .optional(),
    })
    .optional(),
});
