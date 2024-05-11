import { z } from "zod";
// We use this to define the schemas of our product metadata on stripe
// Useful when we need to parse it to display things

export const StripeProductMetadataSchema = z.object({
  role_id: z.string(),
  videos_per_day: z.coerce.number(),
  thumbnails_per_day: z.coerce.number().optional(), // Optional because not every tier allows users to create thumbnails
  tier: z.coerce.number(), // The tier that the subscription is, basic is tier 0, standard is tier 1, pro is tier 2
});
