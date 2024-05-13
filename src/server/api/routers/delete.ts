import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";
import {
  DeleteObjectsCommand,
  type ObjectIdentifier,
} from "@aws-sdk/client-s3";
import { env } from "~/env";
import { s3Client } from "~/server/db";
import { supabaseAdmin } from "~/utils/supabase/admin";
import redis from "~/utils/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

const ratelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  limiter: Ratelimit.fixedWindow(25, "3 m"),
});

export const deleteRouter = createTRPCRouter({
  // This endpoint deletes all files associated with an operation ID
  deleteOperationFiles: protectedProcedure
    .input(
      z.object({
        operationId: z.string(),
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

        // Check db for filemetadata
        const { data } = await ctx.db
          .from("operations_filemetadata")
          .select("*")
          .eq("operation_id", input.operationId)
          .eq("user_id", ctx.user.id);

        if (!data) {
          throw new TRPCClientError("Could not find the files to delete.");
        }

        // Since we store files across multiple buckets, we'll use the s3 key to determine the bucket we should delete from
        const inputObjectsToDelete: ObjectIdentifier[] = [];
        const outputObjectsToDelete: ObjectIdentifier[] = [];

        // Check that each files s3 key starts with the id of the user who is attempting to delete it
        // This is just an extra security measure
        data.forEach((operation) => {
          if (!operation.s3_key?.startsWith(ctx.user.id)) {
            throw new TRPCClientError(
              "You do not have permission to delete these files.",
            );
          }

          // Incase one of the records doesn't have an s3 file key, we'll log this out
          // We will still delete the other files that DO have an s3 key however
          // Start index of 32 since that uuids len of 32
          if (!!operation.s3_key) {
            operation.s3_key.includes("inputs", 32)
              ? inputObjectsToDelete.push({ Key: operation.s3_key })
              : outputObjectsToDelete.push({ Key: operation.s3_key });
          } else {
            console.warn(
              "User is attempting to delete a file with a null s3 key in the operations_filemetadata view",
            );
            console.log("The operation:", operation);
          }
        });

        console.log("Input objects to delete", inputObjectsToDelete);
        console.log("Output objects to delete", outputObjectsToDelete);

        // Create delete requests
        const deleteInputFilesCommand = new DeleteObjectsCommand({
          Bucket: env.S3_INPUT_BUCKET_NAME,
          Delete: {
            Objects: inputObjectsToDelete,
          },
        });

        const deleteOutputFilesCommand = new DeleteObjectsCommand({
          Bucket: env.S3_OUTPUT_BUCKET_NAME,
          Delete: {
            Objects: outputObjectsToDelete,
          },
        });

        // Send delete request
        console.log("Delete input files command:");
        console.log(deleteInputFilesCommand);

        console.log("Delete output files command:");
        console.log(deleteOutputFilesCommand);

        const [deleteInputResult, deleteOutputResult] = await Promise.all([
          s3Client.send(deleteInputFilesCommand),
          s3Client.send(deleteOutputFilesCommand),
        ]);

        // If both requests were successful, delete the data on supabase
        if (
          deleteInputResult.$metadata.httpStatusCode === 200 &&
          deleteOutputResult.$metadata.httpStatusCode === 200
        ) {
          // Delete all operation logs
          const deleteOperationDataResponse = await supabaseAdmin.rpc(
            "delete_all_operation_data",
            {
              operation_to_delete_id: input.operationId,
            },
          );

          console.log(
            "Delete operation data (on db) response:",
            deleteOperationDataResponse,
          );
          // In case we had an error deleting operation data on the db, we'll log this here
          // Eventually we'll need to store this log manually somewhere so we can inspect it
          // If the delete reponse data is == 0, this means we didnt successfully delete an operation document
          // TODO: Implement more logging here
          if (
            deleteOperationDataResponse.error ??
            deleteOperationDataResponse.data == 0
          ) {
            console.error(deleteOperationDataResponse.error);
            throw new TRPCClientError(
              "Something went wrong deleting your data, please contact customer support.",
            );
          }
        } else {
          throw new TRPCClientError(
            "Something went wrong, please try again later or contact customer support.",
          );
        }

        return {
          message: "Successfully deleted your files.",
        };
      } catch (err) {
        if (err instanceof TRPCClientError) {
          throw err;
        }

        throw new TRPCClientError("Something went wrong");
      }
    }),
});
