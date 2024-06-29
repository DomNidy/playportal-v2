import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { headers } from "next/headers";
import { generateTagsRatelimiter } from "~/server/ratelimiters";
import { TRPCClientError } from "@trpc/client";
import {
  chooseTagsUntilMaxStrLengthReached,
  getVideoIdsFromQuery,
  getVideoTagsByVideoIDs,
  sortTagsByOccurance,
} from "~/server/helpers/tags";

export const tagsRouter = createTRPCRouter({
  generateTags: protectedProcedure
    .input(
      z.object({
        // The query string we will use to find related tags
        queryString: z.string().min(1).max(500),
        // The maximum amount of characters of tags you would like returned
        // ex. ['abc', '123'] has tag length of 6
        maxTagsLength: z.number().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headersList = headers();
      const ipIdentifier = headersList.get("x-real-ip");
      const result = await generateTagsRatelimiter.limit(
        ipIdentifier ?? ctx.user.id,
      );

      if (!result.success) {
        throw new TRPCClientError(
          `Please wait a little while before generating more tags.`,
        );
      }

      try {
        const videoIds = await getVideoIdsFromQuery(input.queryString);
        if (videoIds.length == 0) {
          throw new Error(
            `Failed to retrieve any video ids with query string:
            ${input.queryString}`,
          );
        }

        const tags = await getVideoTagsByVideoIDs(videoIds);
        const sortedTags = sortTagsByOccurance(tags);

        if (sortedTags.length === 0) {
          throw new TRPCClientError(
            `Could not find any tags, please try a different query string!`,
          );
        }

        const chosenTags = chooseTagsUntilMaxStrLengthReached(
          sortedTags,
          input.maxTagsLength,
        );

        return chosenTags;
      } catch (err) {
        console.error(err);

        if (err instanceof TRPCClientError) {
          throw err;
        }

        throw new TRPCClientError(
          "Error occured while trying to generate tags, please try a different tag query string or try again later.",
        );
      }
    }),
});
