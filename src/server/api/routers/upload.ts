import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { supabaseAdmin } from "~/server/clients/supabase";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, sqsClient } from "~/server/clients/aws";
import {
  Fonts,
  TextPositioning,
  YoutubeUploadOptions,
  type CreateVideoOptionsMessageSchema,
} from "~/definitions/api-schemas";
import { headers } from "next/headers";
import { VideoPreset } from "~/definitions/api-schemas";
import { YoutubeVideoVisibilities } from "~/definitions/form-schemas";
import {
  createCreateVideoOperation,
  createYoutubeUploadOperation,
  enforceQuotaLimits,
  getOAuthCredentialsForYoutubeChannels,
  getUserCreateVideoQuotaUsage,
  getUserQuotaLimits,
  getUserUploadYoutubeVideoQuotaUsage,
  refundFailedCreateVideoOperation,
  refundFailedUploadVideoOperation,
} from "~/server/helpers/supabase/helpers";
import { type PostgrestResponseSuccess } from "@supabase/postgrest-js";
import { type Database } from "types_db";
import { generateUploadURLRatelimiter } from "~/server/ratelimiters";

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
        videoPreset: z.nativeEnum(VideoPreset),
        textOverlay: z
          .object({
            text: z
              .string()
              .max(100, "Text must be at most 100 characters long"),
            font: z.nativeEnum(Fonts),
            fontSize: z.number().min(1, "Font size must be at least 1"),
            fontColor: z.string(),
            backgroundBox: z.boolean(),
            backgroundBoxColor: z.string(),
            textPositioning: z.nativeEnum(TextPositioning),
            backgroundBoxOpacity: z.number().min(0).max(1),
            backgroundBoxPadding: z
              .number()
              .min(1, "Padding must be at least 1"),
          })
          .optional(),
        uploadVideoOptions: z
          .object({
            youtube: z
              .object({
                videoTitle: z.string().min(1).max(100),
                videoDescription: z.string().max(5000).optional(),
                videoTags: z.array(z.string()).optional(),
                // An array of the channel ids that the video should be uploaded to
                // We will use this as a mapping to the oauth tokens in the db
                uploadToChannels: z.array(z.string()).min(1),
                videoVisibility: z.nativeEnum(YoutubeVideoVisibilities),
              })
              .optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const headersList = headers();
        const ipIdentifier = headersList.get("x-real-ip");
        const result = await generateUploadURLRatelimiter.limit(
          ipIdentifier ?? ctx.user.id,
        );

        if (!result.success) {
          throw new TRPCClientError(
            `Please wait a few minutes before sending another request.`,
          );
        }

        // Parse file extensions
        const audioFileExtension = input.audioFileExtension
          ? `.${input.audioFileExtension}`
          : "";

        const imageFileExtension = input.imageFileExtension
          ? `.${input.imageFileExtension}`
          : "";

        //* Get the quota that the users' plan grants them
        const userQuotas = await getUserQuotaLimits(ctx);
        console.log("Got user quotas", userQuotas);

        //* Get the users current daily create video quota usage
        const createVideoQuotaUsage = await getUserCreateVideoQuotaUsage(ctx);
        console.log("Got create video quota usage", createVideoQuotaUsage);

        //* Get user's daily upload to youtube quota usage if we are uploading to youtube, otherwise set to 0
        // We don't really need to check this if the user is not uploading to youtube, but we will do it anyway
        const uploadYoutubeVideoQuotaUsage =
          await getUserUploadYoutubeVideoQuotaUsage(ctx);

        //* Enforce quota limits
        enforceQuotaLimits(
          userQuotas,
          input,
          createVideoQuotaUsage,
          uploadYoutubeVideoQuotaUsage,
        );

        //* Get the oauth credentials for the youtube channels that the user wants to upload to
        // If we were provided with a list of channel ids to upload to, we will use these to look up the oauth credentials
        let oauthCredentialIDS: string[] | null = null;
        if (input?.uploadVideoOptions?.youtube?.uploadToChannels) {
          // Get the oauth credential ids associated with the service accounts (youtube channel ids in this case)
          const youtubeOAuthCredentials =
            await getOAuthCredentialsForYoutubeChannels(
              ctx,
              input.uploadVideoOptions.youtube.uploadToChannels,
            );

          // Add the oauth credential ids to the array
          oauthCredentialIDS = youtubeOAuthCredentials.map((cred) => cred.id);
        }

        //* Create the operation and transaction in the database, (this charges the user for the create video operation only)
        const createVideoOperation = await createCreateVideoOperation(
          ctx,
          input,
        );

        //* Create the upload video operations and transactions in the database, (this charges the user for the upload video operations)
        let uploadOperationAndTransactionIds = [];
        // Create youtube upload transactions if user wants to upload to youtube
        if (input.uploadVideoOptions?.youtube) {
          console.log("Got oauthCredentialIDS", oauthCredentialIDS);
          if (!oauthCredentialIDS)
            throw new TRPCClientError(
              "Failed to authenticate one or more of your connected youtube channels. Please try re-connecting your accounts.",
            );
          try {
            // Ensure the youtube upload options are valid
            const {
              success: parseYoutubeUploadOptionsSuccess,
              data: youtubeUploadOptions,
              error: youtubeUploadOptionsError,
            } = YoutubeUploadOptions.safeParse({
              kind: "YoutubeUploadOptions",
              video_title: input.uploadVideoOptions.youtube.videoTitle,
              video_visibility:
                input.uploadVideoOptions.youtube.videoVisibility,
              video_description:
                input.uploadVideoOptions.youtube.videoDescription ?? "",
              video_tags: input.uploadVideoOptions.youtube.videoTags ?? [],
            } as z.infer<typeof YoutubeUploadOptions>);

            if (!parseYoutubeUploadOptionsSuccess) {
              console.error(
                `Invalid youtube upload options: ${JSON.stringify(youtubeUploadOptionsError)}`,
              );
              throw new TRPCClientError(
                "Invalid youtube upload options, please check your title, description, tags, etc, and try again. If the problem persists, please contact support.",
              );
            }

            // Charge the user for the upload
            // For each channel, run the upload cost rpc
            // This will return an array of upload operation ids, and their transaction ids
            const youtubeUploadTransactions = await Promise.all(
              oauthCredentialIDS.map(async (credsId) => {
                console.log(
                  `Charging user ${ctx.user.id} for upload using credentials id: ${credsId}`,
                );
                return await createYoutubeUploadOperation(
                  ctx,
                  input,
                  createVideoOperation.operation_id,
                  credsId,
                  {
                    kind: "YoutubeUploadOptions",
                    video_title: youtubeUploadOptions.video_title,
                    video_visibility: youtubeUploadOptions.video_visibility,
                    video_description: youtubeUploadOptions.video_description,
                    video_tags: youtubeUploadOptions.video_tags,
                  },
                );
              }),
            );

            // Push all the upload operation and transaction ids to the array
            uploadOperationAndTransactionIds.push(...youtubeUploadTransactions);

            // Create an array of the failed transactions (if any)
            // Note: Transactions that do not return data are considered failed in this case
            const failedTransactions = uploadOperationAndTransactionIds.filter(
              (transaction) => {
                if (transaction.error ?? !transaction.data) {
                  console.error(
                    `Failed to charge user ${ctx.user.id} for youtube upload, error: ${transaction?.error?.message}`,
                  );
                  return true;
                }
              },
            );

            // If any of the transactions failed, we should refund all upload video transactions AND the create video transaction, then throw an error
            if (failedTransactions.length > 0) {
              console.error(
                `We failed to create some upload youtube video operations for user ${ctx.user.id} for create video operation ${createVideoOperation.operation_id}, we will abort this request and refund all transactions that have occurred so far`,
              );
              throw new Error(
                `Failed to charge user ${ctx.user.id} for youtube upload, refunding all transactions`,
              );
            }
          } catch (error) {
            console.error("Error in youtube upload charge logic:", error);
            console.log(
              "Refunding all transactions in this create video operation",
            );

            //* Note: We refund the upload video transactions in the try block above because that scope has access to the transaction ids
            //* Refund the create video transaction
            await refundFailedCreateVideoOperation(
              createVideoOperation.operation_id,
              createVideoOperation.transaction_id,
            );

            //* Refund all upload video transactions
            if (uploadOperationAndTransactionIds.length > 0) {
              console.log("Refunding all upload youtube video transactions");

              //* Refund all upload video transactions
              await Promise.all(
                uploadOperationAndTransactionIds.map(async (transaction) => {
                  if (transaction.data) {
                    await refundFailedUploadVideoOperation(
                      transaction.data.upload_operation_id,
                      transaction.data.trans_id,
                    );
                  } else {
                    console.warn(
                      "Some upload video transactions could not be refunded...",
                    );
                  }
                }),
              );
            }

            if (error instanceof TRPCClientError) {
              throw error;
            }
            throw new TRPCClientError("Something went wrong");
          }
        }

        // After above logic, the uploadOperationAndTransactionIds array should contain the upload operation and transaction ids, and no failed transactions, so we'll assert that here
        // The assertion we are using is the success response from the rpc function that our createYoutubeUploadOperation function returns
        uploadOperationAndTransactionIds =
          uploadOperationAndTransactionIds as PostgrestResponseSuccess<
            Database["public"]["Functions"]["create_upload_video_operation"]["Returns"][0]
          >[];

        try {
          const audioFileS3Key = `${ctx.user.id}/inputs/${createVideoOperation.operation_id}-input-audio${audioFileExtension}`;
          // Ternary here is used incase we did not receive an input image from user
          const imageFileS3Key = input.imageFileSize
            ? `${ctx.user.id}/inputs/${createVideoOperation.operation_id}-input-image${imageFileExtension}`
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
          const createVideoMessage: z.infer<
            typeof CreateVideoOptionsMessageSchema
          > = {
            kind: "CreateVideoOptions",
            upload_after_creation_options: input?.uploadVideoOptions?.youtube
              ? {
                  youtube: {
                    upload_video_operations:
                      uploadOperationAndTransactionIds.map(
                        (
                          // The type assertion here is safe because we have already checked that the transactions are successful
                          // This is just to shut up the typescript compiler
                          op: PostgrestResponseSuccess<{
                            trans_id: string;
                            upload_operation_id: string;
                            upload_options_id: string;
                          }>,
                        ) => ({
                          upload_video_transaction_id: op.data.trans_id,
                          upload_video_operation_id:
                            op.data.upload_operation_id,
                          upload_video_options_id: op.data.upload_options_id,
                        }),
                      ),
                  },
                }
              : undefined,
            associated_transaction_id: createVideoOperation.transaction_id,
            operation: {
              id: createVideoOperation.operation_id,
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
              preset: input.videoPreset,
              // TODO: Implement text overlay
              text_overlay: input?.textOverlay
                ? {
                    background_box: input.textOverlay.backgroundBox,
                    background_box_color: input.textOverlay.backgroundBoxColor,
                    background_box_opacity:
                      input.textOverlay.backgroundBoxOpacity,
                    background_box_padding:
                      input.textOverlay.backgroundBoxPadding,
                    text_positioning: input.textOverlay.textPositioning,
                    font: input.textOverlay.font,
                    font_color: input.textOverlay.fontColor,
                    font_size: input.textOverlay.fontSize,
                    text: input.textOverlay.text,
                  }
                : undefined,
            },
          };

          console.log(
            "createVideoMessage constructed:",
            JSON.stringify(createVideoMessage),
          );
          // Post the message to sqs queue
          const sendMsgResult = await sqsClient.send(
            new SendMessageCommand({
              QueueUrl: env.SQS_CREATE_VIDEO_QUEUE_URL,
              MessageBody: JSON.stringify(createVideoMessage),
            }),
          );

          console.log("Message sent to SQS queue", sendMsgResult);
          // Return the presigned urls and operation id
          return {
            presignedUrlAudio: presignedUrlAudio,
            presignedUrlImage: presignedUrlImage,
            operationId: createVideoOperation.operation_id,
          };
        } catch (err) {
          //* We should only call this when we know the operation_id and transaction_id exist
          await supabaseAdmin.rpc("handle_failed_operation_refund", {
            operation_id: createVideoOperation.operation_id,
            transaction_to_refund_id: createVideoOperation.transaction_id,
          });

          //* Refund all upload video transactions
          await Promise.all(
            uploadOperationAndTransactionIds.map(
              async (
                transaction: PostgrestResponseSuccess<{
                  upload_operation_id: string;
                  upload_options_id: string;
                  trans_id: string;
                }>,
              ) => {
                if (transaction.data) {
                  await refundFailedUploadVideoOperation(
                    transaction.data.upload_operation_id,
                    transaction.data.trans_id,
                  );
                } else {
                  console.warn(
                    "Some upload video transactions could not be refunded...",
                  );
                }
              },
            ),
          );

          // Re-throw the error after handling refunds
          throw err;
        }
      } catch (error) {
        if (error instanceof TRPCClientError) {
          throw error;
        }
        console.error(error);
        throw new TRPCClientError("Something went wrong");
      }
    }),
});
