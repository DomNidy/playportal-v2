// This is just a central place for us to define the different ratelimiters we want to use

import { Ratelimit } from "@upstash/ratelimit";
import redis from "./clients/upstash";

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

// This is used to rate limit tag generation requests with youtube api
// * This endpoint uses quota, so this is important
// Each call to this endpoint costs 101 yt quota
export const generateTagsRatelimiter = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "generateTags",
  limiter: Ratelimit.fixedWindow(20, "45 m"),
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

// Used to rate limit login server action
export const loginRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "login",
  limiter: Ratelimit.fixedWindow(10, "5 m"),
});

// Used to rate limit signup
export const signUpRatelimit = new Ratelimit({
  redis: redis,
  analytics: true,
  prefix: "signup",
  limiter: Ratelimit.fixedWindow(6, "1 h"),
});
