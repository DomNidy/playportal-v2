import { TRPCClientError } from "@trpc/client";
import { type createTRPCContext } from "./api/trpc";
import { Database } from "types_db";
import { RouterInputs } from "~/trpc/react";
import { supabaseAdmin } from "~/utils/supabase/admin";
import { NonNullableProperties } from "~/utils/utils";

// Alias for the type of the context that is passed to the tRPC API
type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export async function getUserQuotaLimits(ctx: TRPCContext) {
  if (!ctx.user?.id || !ctx.user) {
    handleError("User not found", "Something went wrong. Please try again.");
  }

  const { data: userQuotas, error: quotaLimitQueryError } = await ctx.db
    .rpc("get_user_quota_limits", {
      user_id: ctx.user.id,
    })
    .maybeSingle();

  if (!userQuotas || quotaLimitQueryError) {
    handleError(
      quotaLimitQueryError ?? "User quota limits not found",
      "Something went wrong. Please try again.",
    );
  }

  return userQuotas;
}

export async function getUserCreateVideoQuotaUsage(ctx: TRPCContext) {
  if (!ctx.user?.id || !ctx.user) {
    handleError("User not found", "Something went wrong. Please try again.");
  }

  //* Check the users current daily create video quota usage
  const { data: createVideoQuotaUsage, error: quotaUsageQueryError } =
    await ctx.db.rpc("get_user_quota_usage_daily_create_video", {
      user_id: ctx.user.id,
    });

  if (createVideoQuotaUsage === null || quotaUsageQueryError) {
    handleError(
      quotaUsageQueryError ?? "User quota usage not found",
      "Something went wrong. Please try again.",
    );
  }

  return createVideoQuotaUsage;
}

export async function getUserUploadYoutubeVideoQuotaUsage(ctx: TRPCContext) {
  if (!ctx.user?.id || !ctx.user) {
    handleError("User not found", "Something went wrong. Please try again.");
  }

  //* Check the users current daily create video quota usage
  const { data: uploadYoutubeVideoQuotaUsage, error: quotaUsageQueryError } =
    await ctx.db.rpc("get_user_quota_usage_daily_upload_youtube_video", {
      user_id: ctx.user.id,
    });

  if (uploadYoutubeVideoQuotaUsage === null || quotaUsageQueryError) {
    handleError(
      quotaUsageQueryError ?? "User quota usage not found",
      "Something went wrong. Please try again.",
    );
  }

  return uploadYoutubeVideoQuotaUsage;
}

// This is a centralized error handler that logs the error and returns a user-friendly message
export function handleError(error: unknown, message: string): never {
  console.error(error);
  throw new TRPCClientError(message);
}

export function enforceQuotaLimits(
  userQuotaLimits: Database["public"]["Functions"]["get_user_quota_limits"]["Returns"][0],
  userInput: RouterInputs["upload"]["generateUploadURL"],
  createVideoQuotaUsage: number,
  uploadYoutubeVideoQuotaUsage: number,
) {
  // Enforce that the user has not exceeded their daily create video quota
  if (userQuotaLimits.create_video_daily_quota <= createVideoQuotaUsage) {
    throw new TRPCClientError(
      "You have exceeded your plan's create video quota. Please try again tomorrow or upgrade your plan.",
    );
  }

  // Enforce that the uploaded file size is less than the user's file size limit
  if (
    userInput.audioFileSize >
    userQuotaLimits.file_size_limit_mb * 1024 * 1024
  ) {
    throw new TRPCClientError(
      "The audio file size exceeds the limit. Please upload a smaller audio file.",
    );
  }

  // Only allow image files that are less than 8MB
  if (userInput.imageFileSize && userInput.imageFileSize > 8 * 1024 * 1024) {
    throw new TRPCClientError(
      "The image file size exceeds the limit. Please upload a smaller image file.",
    );
  }

  // Count the amount of youtube channels the user wants to upload to
  const requestedYoutubeUploads =
    userInput.uploadVideoOptions?.youtube?.uploadToChannels.length ?? 0;
  console.log(
    "User is trying to upload to",
    requestedYoutubeUploads,
    "YouTube channels",
  );

  // Enforce that the user will not exceed their daily YouTube upload quota after the requested uploads are made
  if (
    userQuotaLimits.upload_youtube_daily_quota <
    uploadYoutubeVideoQuotaUsage + requestedYoutubeUploads
  ) {
    throw new TRPCClientError(
      "You have exceeded your plan's YouTube upload quota. Please try again tomorrow or upgrade your plan.",
    );
  }
}

// When passed an operationId, and a transactionId, run the rpc that refunds the transaction and sets the operation to failed
export async function refundFailedCreateVideoOperation(
  createVideoOperationId: string,
  transactionToRefundId: string,
) {
  const { error: refundError } = await supabaseAdmin.rpc(
    "handle_failed_operation_refund",
    {
      operation_id: createVideoOperationId,
      transaction_to_refund_id: transactionToRefundId,
    },
  );

  if (refundError) {
    console.warn(
      `An error occured while trying to refund operation ${createVideoOperationId} and transaction ${transactionToRefundId}`,
    );
    return;
  }

  console.log(
    `Successfully refunded operation ${createVideoOperationId} and transaction ${transactionToRefundId}`,
  );
}

export async function refundFailedUploadVideoOperation(
  uploadVideoOperationId: string,
  transactionToRefundId: string,
) {
  const { error: refundError } = await supabaseAdmin.rpc(
    "handle_failed_upload_video_operation_refund",
    {
      upload_video_operation_id: uploadVideoOperationId,
      transaction_id_to_refund: transactionToRefundId,
    },
  );

  if (refundError) {
    console.warn(
      `An error occured while trying to refund operation ${uploadVideoOperationId} and transaction ${transactionToRefundId}`,
    );
    return;
  }

  console.log(
    `Successfully refunded operation ${uploadVideoOperationId} and transaction ${transactionToRefundId}`,
  );
}

export async function createCreateVideoOperation(
  ctx: TRPCContext,
  userInput: RouterInputs["upload"]["generateUploadURL"],
): Promise<
  NonNullableProperties<
    Database["public"]["Functions"]["create_operation_and_transaction"]["Returns"]
  >
> {
  const { data: createVideoOperation, error: createVideoOperationError } =
    await supabaseAdmin.rpc("create_operation_and_transaction", {
      user_id: ctx.user!.id,
      video_title: userInput?.videoTitle,
    });

  if (
    !createVideoOperation ??
    createVideoOperationError ??
    !createVideoOperation.operation_id ??
    !createVideoOperation.transaction_id
  ) {
    handleError(
      createVideoOperationError ?? "Create video operation not found",
      "Something went wrong. Please try again.",
    );
  }

  return {
    operation_id: createVideoOperation.operation_id,
    transaction_id: createVideoOperation.transaction_id,
  };
}

export async function createYoutubeUploadOperation(
  ctx: TRPCContext,
  userInput: RouterInputs["upload"]["generateUploadURL"],
  // The operation id of the create video operation that this upload operation is related to
  relatedCreateVideoOperationId: string,
  // The primary key used in oauth creds table, we'll use this to get the oauth creds we need to upload the video
  oAuthCredsId: string,
) {
  if (!ctx.user?.id || !ctx.user) {
    handleError("User not found", "Something went wrong. Please try again.");
  }

  return await supabaseAdmin
    .rpc("create_upload_video_operation", {
      user_id: ctx.user.id,
      created_from_operation_id: relatedCreateVideoOperationId,
      using_oauth_creds_id: oAuthCredsId,
      metadata: {
        video_title: userInput?.uploadVideoOptions?.youtube?.videoTitle,
        video_description:
          userInput?.uploadVideoOptions?.youtube?.videoDescription,
        video_tags: userInput?.uploadVideoOptions?.youtube?.videoTags,
        video_visibility:
          userInput?.uploadVideoOptions?.youtube?.videoVisibility,
      },
    })
    .single();
}

export async function getOAuthCredentialsForYoutubeChannels(
  ctx: TRPCContext,
  serviceAccountIds: string[],
) {
  if (!ctx.user?.id || !ctx.user) {
    handleError("User not found", "Something went wrong. Please try again.");
  }

  const { data: oauthCredentials, error: oauthCredentialsQueryError } =
    await supabaseAdmin
      .from("oauth_creds")
      .select("id")
      .eq("user_id", ctx.user.id)
      .in("service_account_id", [...serviceAccountIds]);

  if (!oauthCredentials || oauthCredentialsQueryError) {
    handleError(
      oauthCredentialsQueryError ?? "OAuth credentials not found",
      "Something went wrong while trying to authenticate with YouTube. Please try linking your account again.",
    );
  }

  return oauthCredentials;
}
