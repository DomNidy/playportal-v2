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
import redis from "~/utils/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

const ratelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  limiter: Ratelimit.fixedWindow(3, "3 m"),
});

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
        const headersList = headers();
        const ipIdentifier = headersList.get("x-real-ip");
        const result = await ratelimit.limit(ipIdentifier ?? "");

        if (!result.success) {
          throw new TRPCClientError(
            `Please wait a few minutes before sending another request.`,
          );
        }

        //* Check the quota that the users' plan grants them
        const { data: userQuotas, error: quotaLimitQueryError } = await ctx.db
          .rpc("get_user_quota_limits", {
            user_id: ctx.user.id,
          })
          .single();

        // Handle case where we are unable to retrieve the quota limits for a user
        // This can occur if a user has no `user_role`, if a user tries to create a video and they are not subscribed, they will be stopped here
        if (!userQuotas) {
          console.warn(
            `Failed to retrieve quota limits for user [${ctx.user.id}], if the user does not have an active subscription, this is expected behavior.`,
          );
          throw new TRPCClientError(
            "An active subscription is required to perform this action, if you think this is a mistake; please contact support or try again later.",
          );
        } else if (quotaLimitQueryError) {
          console.error(
            `Error occured while trying to get the quota limits for user ${ctx.user.id}`,
          );
          throw new TRPCClientError(
            `An error occured, please try again later or contact support`,
          );
        }

        //* Check the users current daily quota usage
        const { data: dailyQuotaUsed, error: quoatedUsedQueryError } =
          await ctx.db.rpc("get_user_quota_usage_daily_create_video", {
            user_id: ctx.user.id,
          });

        // Handle the case where we are unable to check the quota usage for a user
        // If an error happens here, it may be network related, or an issue relating to the `transactions` or `transactions_refund` tables
        if (quoatedUsedQueryError ?? dailyQuotaUsed === null) {
          console.error(
            `Failed to check the daily quota usage for user [${ctx.user.id}]`,
          );
          console.error(
            `Query error: ${quoatedUsedQueryError?.message ?? "no query error"}`,
          );
          throw new TRPCClientError(
            `An error occured, please try again later or contact support`,
          );
        }

        //* Check that the user has not exceeded their daily quota usage
        // If the user has exceeded their quota for the day, deny them
        if (dailyQuotaUsed >= userQuotas.create_video_daily_quota) {
          console.warn(
            `User [${ctx.user.id}] attempted to create a video, but they've exceeded their daily quota usage.`,
          );
          throw new TRPCClientError(
            `You have exceeded your daily quota usage, please wait until tomorrow, or upgrade your plan.`,
          );
        }

        // This rpc is a transaction which creates the operation record, creates transaaction record, and decrements the user balaance
        const { data: transactionData, error: createOperationError } =
          await supabaseAdmin.rpc("create_operation_and_transaction", {
            user_id: ctx.user.id,
            video_title: input.videoTitle,
          });

        if (
          createOperationError ??
          !transactionData?.transaction_id ??
          !transactionData?.operation_id
        ) {
          console.error(
            `An error occured while trying to create the operation and transaction documents`,
          );
          console.error(
            "Operation error:",
            createOperationError,
            "Transaction data:",
            transactionData,
          );
          throw new TRPCClientError(
            "Something went wrong, please try again later or contct support",
          );
        } else {
          console.log(transactionData);
        }

        // Parse file extensions
        const audioFileExtension = input.audioFileExtension
          ? `.${input.audioFileExtension}`
          : "";

        const imageFileExtension = input.imageFileExtension
          ? `.${input.imageFileExtension}`
          : "";

        try {
          const audioFileS3Key = `${ctx.user.id}/inputs/${transactionData.operation_id}-input-audio${audioFileExtension}`;
          // Ternary here is used incase we did not receive an input image from user
          const imageFileS3Key = input.imageFileSize
            ? `${ctx.user.id}/inputs/${transactionData.operation_id}-input-image${imageFileExtension}`
            : null;

          // Create the S3 presigned urls first, if we fail to create those, run handle refund logic
          const presignedUrlAudio = await getSignedUrl(
            s3Client,
            new PutObjectCommand({
              Bucket: env.S3_INPUT_BUCKET_NAME,
              Key: audioFileS3Key,
              ContentLength: input.audioFileSize,
            }),
            { expiresIn: env.S3_PRESIGNED_URL_UPLOAD_EXP_TIME_SECONDS },
          );

          const presignedUrlImage = imageFileS3Key
            ? await getSignedUrl(
                s3Client,
                new PutObjectCommand({
                  Bucket: env.S3_INPUT_BUCKET_NAME,
                  Key: imageFileS3Key,
                  ContentLength: input.imageFileSize,
                }),
                { expiresIn: env.S3_PRESIGNED_URL_UPLOAD_EXP_TIME_SECONDS },
              )
            : null;

          // Create message that we will post to sqs queue
          const createVideoMessage: z.infer<typeof CreateVideoOptionsSchema> = {
            associated_transaction_id: transactionData.transaction_id,
            operation: {
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
            transaction_to_refund_id: transactionData.transaction_id,
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
