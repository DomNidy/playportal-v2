import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

export const uploadRouter = createTRPCRouter({
  generateUploadURL: protectedProcedure
    .input(
      z.object({
        videoTitle: z.string().min(1),
        audioFileContentType: z.string(),
        audioFileSize: z.number(),
        imageFileContentType: z.string().optional(),
        imageFileSize: z.number().optional(),
        audioFileExtension: z.string().nullable(),
        imageFileExtension: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const operationCost = 10;
      const { data: userCredits, error } = await ctx.db
        .from("user_data")
        .select("credits")
        .eq("id", ctx.user.id)
        .single();

      console.log("Users credits:", userCredits);

      if (error) {
        throw new TRPCClientError("Insufficient credits");
      }

      return 0;
    }),
});
