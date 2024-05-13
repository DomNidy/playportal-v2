import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AMAZON_ACCESS_KEY_ID: z.string().min(1),
    AMAZON_SECRET_ACCESS_KEY: z.string().min(1),
    S3_INPUT_BUCKET_NAME: z.string().min(1),
    S3_OUTPUT_BUCKET_NAME: z.string().min(1),
    S3_REGION: z.string().min(1),
    S3_PRESIGNED_URL_UPLOAD_EXP_TIME_SECONDS: z.number(),
    S3_PRESIGNED_URL_DOWNLOAD_EXP_TIME_SECONDS: z.number(),
    SQS_QUEUE_URL: z.string().min(1),
    SQS_REGION: z.string().min(1),
    SUPABASE_SERVICE_ROLE: z.string().min(1),
    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_TRIAL_PERIOD_DAYS: z.number(),
    // Upstash
    UPSTASH_REDIS_REST_URL: z.string(),
    UPSTASH_REDIS_REST_TOKEN: z.string()
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_SITE_URL: z.string(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string()
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    AMAZON_ACCESS_KEY_ID: process.env.AMAZON_ACCESS_KEY_ID,
    AMAZON_SECRET_ACCESS_KEY: process.env.AMAZON_SECRET_ACCESS_KEY,
    S3_INPUT_BUCKET_NAME: process.env.S3_INPUT_BUCKET_NAME,
    S3_OUTPUT_BUCKET_NAME: process.env.S3_OUTPUT_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION,
    S3_PRESIGNED_URL_DOWNLOAD_EXP_TIME_SECONDS: parseInt(process.env.S3_PRESIGNED_URL_DOWNLOAD_EXP_TIME_SECONDS ?? "60"),
    S3_PRESIGNED_URL_UPLOAD_EXP_TIME_SECONDS: parseInt(process.env.S3_PRESIGNED_URL_UPLOAD_EXP_TIME_SECONDS ?? "180"),
    SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
    SQS_REGION: process.env.SQS_REGION,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_TRIAL_PERIOD_DAYS: parseInt(process.env.STRIPE_TRIAL_PERIOD_DAYS ?? "14"),
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
