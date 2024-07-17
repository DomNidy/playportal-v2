import { z } from "zod";
import { YoutubeVideoVisibilities } from "./form-schemas";

export enum VideoPreset {
  YouTube = "YouTube",
  TikTok = "TikTok",
}

// List of fonts that are allowed to be used in the text overlay
export enum Fonts {
  Apollo = "Apollo",
  Europa = "Europa",
  Memory = "Memory",
  Sketch = "Sketch",
  Poros = "Poros",
  MontserratBold = "MontserratBold",
  MontserratRegular = "MontserratRegular",
  RobotoMedium = "RobotoMedium",
  RobotoBlack = "RobotoBlack",
  RobotoBold = "RobotoBold",
}
export enum TextPositioning {
  TopLeft = "TopLeft",
  TopRight = "TopRight",
  BottomLeft = "BottomLeft",
  BottomRight = "BottomRight",
  Center = "Center",
}

export const YoutubeUploadOptions = z.object({
  kind: z.literal("YoutubeUploadOptions"),
  video_title: z
    .string()
    .min(1)
    .max(100, "Title must be at most 100 characters long"),
  video_description: z
    .string()
    .max(5000, "Description may be no longer than 5000 characters.")
    .optional(),
  video_tags: z.array(z.string()).optional(),
  video_visibility: z.nativeEnum(YoutubeVideoVisibilities),
});

export const CreateVideoOptionsMessageSchema = z.object({
  kind: z.literal("CreateVideoOptions"),
  user_id: z.string(),
  associated_transaction_id: z.string(),
  upload_after_creation_options: z
    .object({
      youtube: z
        .object({
          // An array of objects containing the `upload_video_operation` ids and the associated `transaction` ids, so we can refund them on the lambda side if the video creation fails
          // We will use the foreign key relation in the `upload_video_operation` table to lookup the associated `oauth_creds` id in the lambdas
          upload_video_operations: z
            .array(
              z.object({
                upload_video_operation_id: z.string(),
                upload_video_transaction_id: z.string(),
                // The primary key of a row in the `upload_video_options` table
                // This will row will contain metadata about the video, such as description, tags, etc.
                upload_video_options_id: z.string(),
              }),
            )
            .min(1, "Must provide at least one upload video operation"),
        })
        .optional(),
    })
    .optional(),
  operation: z.object({
    id: z.string(),
  }),
  video_output_options: z.object({
    preset: z.nativeEnum(VideoPreset),
    quality_level: z.enum(["low", "medium", "high"]),
    text_overlay: z
      .object({
        text: z.string(),
        font: z.nativeEnum(Fonts),
        font_size: z.number(),
        font_color: z.string(),
        background_box: z.boolean(),
        background_box_color: z.string(),
        background_box_opacity: z.number(),
        background_box_padding: z.number(),
        text_positioning: z
          .nativeEnum(TextPositioning)
          .default(TextPositioning.Center),
      })
      .optional(),
  }),
  audio_file: z.object({
    s3_key: z.string(),
    file_size_bytes: z.number(),
  }),
  image_file: z
    .object({
      s3_key: z.string(),
      file_size_bytes: z.number(),
    })
    .nullable(),
});

export const UploadVideoOptionsSchema = z.object({
  kind: z.literal("UploadVideoOptions"),
  user_id: z.string(),
  // Id of an upload options row in the "upload_video_options" table
  upload_options_id: z.enum(["YouTube"]),
  // The service account id (things like youtube channel ids) that will be used to upload the video
  // We will use this to look up the users oauth credentials
  service_account_id: z.string(),
  // This is associated with an "UploadVideo" transaction from the "transactions" table
  associated_transaction_id: z.string(),
  operation: z.object({
    id: z.string(),
    create_video_id: z.string(),
  }),
  video_file: z.object({
    s3_key: z.string(),
  }),
});

export const YoutubeDescriptionSchema = z.object({
  descriptionText: z
    .string()
    .min(1)
    .max(5000, "Description may be no longer than 5000 characters"),
});
