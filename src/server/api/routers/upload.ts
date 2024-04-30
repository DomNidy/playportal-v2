import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";
import { SQSClient } from "@aws-sdk/client-sqs";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { createClient } from "~/utils/supabase/server";
import { supabaseAdmin } from "~/utils/supabase/admin";

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
      //* We could remove this query entirely and just rely on the rpc call, but this is more convenient for now
      const { data: userCredits, error } = await ctx.db
        .from("user_data")
        .select("credits")
        .eq("id", ctx.user.id)
        .single();

      if (error) {
        throw new TRPCClientError(
          "Error occured while trying to start the operation",
        );
      }

      if (userCredits.credits < operationCost) {
        throw new TRPCClientError("Insufficient credits.");
      }

      // This rpc is a transaction which creates the operation record, creates transaaction record, and decrements the user balaance
      const { data, error: rpcError } = await supabaseAdmin.rpc(
        "create_operation_and_transaction",
        {
          cost: 10,
          user_id: ctx.user.id,
          video_title: input.videoTitle,
        },
      );

      if (rpcError) {
        console.error(rpcError);
        throw new TRPCClientError("Something went wrong");
      } else {
        console.log(data);
      }

      // 2. Create the S3 presigned urls first, if we fail to create those, run handle refund logic
      // 3. If presigned urls are created, try to post message to sqs queue, if we fail to post message, run handle refund logic

      // 4. return the presigned urls
      return 0;
    }),
});
