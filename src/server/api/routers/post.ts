import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createClient } from "~/utils/supabase/server";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
      };
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient();

    const { data: posts, error } = await supabase
      .from("posts")
      .select("author_id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error(error);
      throw new TRPCClientError("Error occured while fetching data");
    }

    return posts;
  }),
});
