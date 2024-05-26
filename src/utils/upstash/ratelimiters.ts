// This is just a central place for us to define the different ratelimiters we want to use

import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

// This is used to ratelimit the `deleteOperationFiles` endpoint
export const deleteOperationRatelimiter = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "deleteOperation",
  limiter: Ratelimit.fixedWindow(25, "3 m"),
});

// This is used to ratelimit the `generateUploadURL` endpoint to prevent spam video creations
export const generateUploadURLRatelimiter = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "generateUploadURL",
  limiter: Ratelimit.fixedWindow(10, "3 m"),
});

// Used to rate limit getPresignedUrlForFile
export const getPresignedUrlForFileRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "getPresignedUrl",
  limiter: Ratelimit.fixedWindow(25, "3 m"),
});

// Used for rate limiting getUserVideos
export const getUserVideosRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "getUserVideos",
  limiter: Ratelimit.slidingWindow(50, "2 m"),
});

// Used to rate limit resetPasswordForEmail server action so our resend quota doesn't get increased
export const resetPasswordForEmailRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "resetPasswordForEmail",
  limiter: Ratelimit.fixedWindow(3, "10 m"),
});

// Used to rate limit signupToMailingList server action
export const signupToMailingListRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "signupToMailingList",
  limiter: Ratelimit.fixedWindow(3, "10 m"),
});
