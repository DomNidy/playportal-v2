import { z } from "zod";
import { Fonts, TextPositioning, VideoPreset } from "./api-schemas";
import { isFileExtensionInList } from "~/utils/utils";

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

export const SupportedAudioFileExtensions = [".mp3", ".wav", ".ogg"];
export const SupportedImageFileExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".jfif",
];

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
      return isFileExtensionInList(file.name, SupportedAudioFileExtensions);
    },
    {
      message: "Audio file must be a .mp3, .wav, or .ogg file",
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

        return isFileExtensionInList(filePath, SupportedImageFileExtensions);
      },
      {
        message: "Image file must be a .png, .jpg, .jpeg, or .webp file",
      },
    )
    .optional()
    .nullish(),
  videoPreset: z.nativeEnum(VideoPreset),

  textOverlay: z
    .object({
      text: z.string().max(100, "Text must be at most 100 characters long"),
      font: z.nativeEnum(Fonts),
      fontSize: z.number().min(1, "Font size must be at least 1"),
      fontColor: z.string().min(1, "Font color must be a hex color code"),
      backgroundBox: z.boolean(),
      backgroundBoxColor: z.string(),
      backgroundBoxOpacity: z.number().min(0).max(1),
      backgroundBoxPadding: z.number().min(1, "Padding must be at least 1"),
      textPositioning: z.nativeEnum(TextPositioning),
    })
    .optional(),

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

// Schema for the first step in the create video form
export const CreateVideoFormUploadAudioSchema = z.object({
  audioFile: z.any().refine(
    (file: File) => {
      if (!file) {
        return false;
      }
      return isFileExtensionInList(file.name, SupportedAudioFileExtensions);
    },
    {
      message: "Audio file must be a .mp3, .wav, or .ogg file",
    },
  ),
});

// Schema for the second step in the create video form
export const CreateVideoFormUploadImageSchema = z.object({
  imageFile: z.any().refine(
    (file: File) => {
      const filePath = file?.name;
      if (!filePath) {
        return false;
      }

      return isFileExtensionInList(filePath, SupportedImageFileExtensions);
    },
    {
      message: "Image file must be a .png, .jpg, .jpeg, .jfif, or .webp file",
    },
  ),
});

// Schema for the third step in the create video form
export const CreateVideoFormUploadOptionsSchema = z.object({
  videoTitle: z
    .string()
    .min(1, "Title must be at least 1 character long")
    .max(100, "Title must be at most 100 characters long"),
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

// Schema for the text overlay step in the create video form
export const CreateVideoFormTextOverlaySchema = z.object({
  text: z
    .string()
    .min(1, "Text must be at least 1 character long")
    .max(100, "Text must be at most 100 characters long"),
  font: z.nativeEnum(Fonts),
  fontSize: z.number().min(1, "Font size must be at least 1"),
  fontColor: z.string(),
  textPositioning: z.nativeEnum(TextPositioning),
  backgroundBoxSettings: z
    .object({
      backgroundBoxColor: z.string(),
      backgroundBoxOpacity: z.number().min(0).max(1),
      backgroundBoxPadding: z.number().min(1, "Padding must be at least 1"),
    })
    .optional(),
});

//* We need to make sure that the created title is >= 100 characters
export const TitleBuilderFormSchema = z.object({
  beatDescriptors: z
    .array(z.string())
    .min(1, "Please enter at least one beat descriptor.")
    .max(3)
    .refine((descriptors) => {
      const descriptorsLength = descriptors.join("").length;
      return descriptorsLength >= 1;
    }, "Please enter at least one beat descriptor."),
  beatAvailability: z.enum(["Free", "FreeForProfit", "NoLabel"]),
  beatName: z.string().min(1, "Beat name must be at least 1 character long"),
  title: z
    .string()
    .min(1, "Title must be at least 1 character long")
    .max(
      100,
      "Title must be at most 100 characters long, please try to shorten your descriptors.",
    ),
});

export const TagGeneratorFormSchema = z.object({
  queryString: z.string().min(1).max(500),
});

// This form schema is for the description template form that applies a description template, not the one that saves it
export const ApplyDescriptionTemplateFormSchema = z.object({
  description: z.string().max(5000),
});

export const CreateNewDescriptionTemplateFormSchema = z.object({
  descriptionText: z.string().min(1).max(5000),
  templateName: z.string().min(1).max(100),
  // Currently only supports YouTube
  platform: z.enum(["YouTube"]),
});

export const UpdateDescriptionTemplateFormSchema = z.object({
  templateId: z.string(),
  descriptionText: z.string().min(1).max(5000),
  templateName: z.string().min(1).max(100),
  platform: z.enum(["YouTube"]),
});
