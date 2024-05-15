import { z } from "zod";

export enum VideoPreset {
  YouTube = "YouTube",
  TikTok = "TikTok",
}

export const CreateVideoOptionsSchema = z.object({
  user_id: z.string(),
  associated_transaction_id: z.string(),
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
