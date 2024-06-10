import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { env } from "~/env";

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: env.AMAZON_SECRET_ACCESS_KEY,
  },
  region: env.S3_REGION,
});

export const sqsClient = new SQSClient({
  credentials: {
    accessKeyId: env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: env.AMAZON_SECRET_ACCESS_KEY,
  },
  region: env.SQS_REGION,
});
