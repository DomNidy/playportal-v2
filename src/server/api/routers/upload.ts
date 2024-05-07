import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { supabaseAdmin } from "~/utils/supabase/admin";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, sqsClient } from "~/server/db";
import { type CreateVideoOptionsSchema } from "~/definitions/api-schemas";

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
      try {
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
        const { data: transactionData, error: createOperationError } =
          await supabaseAdmin.rpc("create_operation_and_transaction", {
            cost: 10,
            user_id: ctx.user.id,
            video_title: input.videoTitle,
          });

        if (
          createOperationError ??
          !transactionData?.transaction_id ??
          !transactionData?.operation_id
        ) {
          console.error(
            createOperationError,
            "returned transaction data",
            transactionData,
          );
          throw new TRPCClientError("Something went wrong");
        } else {
          console.log(transactionData);
        }

        try {
          const audioFileS3Key = `${ctx.user.id}/inputs/${transactionData.operation_id}-input-audio`;
          // Ternary here is used incase we did not receive an input image from user
          const imageFileS3Key = input.imageFileSize
            ? `${ctx.user.id}/inputs/${transactionData.operation_id}-input-image`
            : null;

          // Create the S3 presigned urls first, if we fail to create those, run handle refund logic
          const presignedUrlAudio = await getSignedUrl(
            s3Client,
            new PutObjectCommand({
              Bucket: env.S3_INPUT_BUCKET_NAME,
              Key: audioFileS3Key,
              ContentLength: input.audioFileSize,
            }),
          );

          const presignedUrlImage = imageFileS3Key
            ? await getSignedUrl(
                s3Client,
                new PutObjectCommand({
                  Bucket: env.S3_INPUT_BUCKET_NAME,
                  Key: imageFileS3Key,
                  ContentLength: input.imageFileSize,
                }),
              )
            : null;

          // Create message that we will post to sqs queue
          const createVideoMessage: z.infer<typeof CreateVideoOptionsSchema> = {
            associated_transaction_id: transactionData.transaction_id,
            operation: {
              cost: operationCost,
              id: transactionData.operation_id,
            },
            audio_file: {
              file_size_bytes: input.audioFileSize,
              s3_key: audioFileS3Key,
            },
            // Destructure image_file into the message if user uploaded an image, otherwise set to null
            ...(imageFileS3Key && input.imageFileSize
              ? {
                  image_file: {
                    file_size_bytes: input.imageFileSize,
                    s3_key: imageFileS3Key,
                  },
                }
              : { image_file: null }),
            user_id: ctx.user.id,
            video_output_options: {
              quality_level: "high",
            },
          };

          // Post the message to sqs queue
          await sqsClient.send(
            new SendMessageCommand({
              QueueUrl: env.SQS_QUEUE_URL,
              MessageBody: JSON.stringify(createVideoMessage),
            }),
          );

          return {
            presignedUrlAudio: presignedUrlAudio,
            presignedUrlImage: presignedUrlImage,
            operationId: transactionData.operation_id,
          };
        } catch (err) {
          //* We should only call this when we know the operation_id and transaction_id exist
          await supabaseAdmin.rpc("handle_failed_operation_refund", {
            operation_id: transactionData.operation_id,
            transaction_id_to_refund: transactionData.transaction_id,
            refund_amount: operationCost,
          });
        }

        // 4. return the presigned urls
      } catch (error) {
        if (error instanceof TRPCClientError) {
          throw error;
        }
        throw new TRPCClientError("Something went wrong");
      }
    }),
});
