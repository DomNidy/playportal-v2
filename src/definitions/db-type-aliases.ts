// Here we define type aliases just to make the types more readable

import { type Database } from "types_db";

export type OperationLogCode =
  Database["public"]["Enums"]["operation_logs_enum"];

export type KitType = Database["public"]["Enums"]["kit_type"];

export type FeatureFlag = Database["public"]["Enums"]["feature"];

export type UploadStatus = Database["public"]["Enums"]["upload_video_status"];
export type UploadPlatforms = Database["public"]["Enums"]["upload_platform"];

export type OperationStatus = Database["public"]["Enums"]["operation_status"];

export type YoutubeChannelSummary = {
  channelId: string;
  channelTitle: string;
  channelAvatar: string | null;
};
