import { eq } from "drizzle-orm";
import { users } from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

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
    console.log("Session", ctx.session);

    // TODO: We need to include our supabase auth state in our trpc context
    const res = await ctx.db
      .select({
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, "123"));
    return 1;
  }),
});
