import { type Database } from "types_db";
import { z } from "zod";
import { YoutubeVideoVisibilities } from "./form-schemas";

export enum VideoPreset {
  YouTube = "YouTube",
  TikTok = "TikTok",
}

export const CreateVideoOptionsSchema = z.object({
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
                transaction_id: z.string(),
              }),
            )
            .min(1, "Must provide at least one upload video operation"),
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
  // Once we add support for other platforms, we will need to update this schema to be a union that includes the other platforms
  upload_platform: z.enum(["YouTube"]),
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
