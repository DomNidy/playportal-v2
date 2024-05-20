import { Database } from "types_db";
import { z } from "zod";

export enum VideoPreset {
  YouTube = "YouTube",
  TikTok = "TikTok",
}

export const CreateVideoOptionsSchema = z.object({
  kind: z.literal("CreateVideoOptions"),
  user_id: z.string(),
  associated_transaction_id: z.string(),
  upload_video_to_youtube_after_creation: z.boolean().default(false),
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
  upload_platform: z.literal(
    "YouTube" as Database["public"]["Enums"]["upload_platform"],
  ),
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
