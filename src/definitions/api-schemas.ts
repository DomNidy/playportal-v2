import { z } from "zod";

export const CreateVideoOptionsSchema = z.object({
  user_id: z.string(),
  associated_transaction_id: z.string(),
  operation: z.object({
    id: z.string(),
    cost: z.number(),
  }),
  video_output_options: z.object({
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
