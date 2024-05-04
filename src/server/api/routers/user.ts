import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "~/server/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const userCredits = await ctx.db
      .from("user_data")
      .select("credits")
      .eq("id", ctx.user.id)
      .single();

    return {
      credits: userCredits.data,
      user: await ctx.db.auth.getUser(),
    };
  }),
  getUserVideos: protectedProcedure
    .input(
      z.object({
        cursor: z.number().nullish(), // the offset we'll use
        limit: z.number().min(1).max(100).nullish(), // the limit we'll use
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = input.cursor ?? 0;
      const limit = input.limit ?? 10;

      const { data } = await ctx.db
        .from("operations_filemetadata")
        .select("*")
        .eq("user_id", ctx.user.id)
        .eq("file_origin", "PlayportalBackend")
        .eq("file_type", "Video")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit);

      const nextCursor = (data?.length ?? 0) >= limit ? offset + limit : null;

      return {
        data,
        nextCursor: nextCursor,
      };
    }),
  getPresignedUrlForFile: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Query db to check user owns the file pointed to by s3 key
      const userOwnsFile = await ctx.db
        .from("operations_filemetadata")
        .select("*")
        .eq("s3_key", input.s3Key)
        .eq("user_id", ctx.user.id)
        .eq("file_origin", "PlayportalBackend")
        .eq("file_type", "Video")
        .single();

      console.log(userOwnsFile, input);

      // TODO: Perhaps we could cache this presigned url?
      if (
        userOwnsFile.data?.s3_key === input.s3Key &&
        userOwnsFile.data.user_id === ctx.user.id
      ) {
        return getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: env.S3_OUTPUT_BUCKET_NAME,
            Key: input.s3Key,
            ResponseContentDisposition: `attachment; filename=${userOwnsFile.data?.video_title ?? "your-video"}.mp4`,
          }),
          { expiresIn: 60 * 60 * 11 },
        );
      }

      throw new Error("User does not own the file");
    }),
});
