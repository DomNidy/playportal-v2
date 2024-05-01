import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const transactionsRouter = createTRPCRouter({
  getTransactions: protectedProcedure
    .input(
      z.object({
        cursor: z.number().nullish(), // the offset we'll use
        limit: z.number().min(1).max(100).nullish(), // the limit we'll use
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = input.cursor ?? 0;
      const limit = input.limit ?? 10;

      const { data } = await ctx.db
        .from("transactions")
        .select("*")
        .eq("user_id", ctx.user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit);

      const nextCursor = (data?.length ?? 0) >= limit ? offset + limit : null;
      console.log(nextCursor, data?.length, limit, offset);
      
      return {
        data,
        nextCursor: nextCursor,
      };
    }),
});
