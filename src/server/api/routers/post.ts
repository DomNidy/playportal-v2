import { eq } from "drizzle-orm";
import { auth_users } from "drizzle/schema";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
        email: auth_users.email,
        createdAt: auth_users.createdAt,
      })
      .from(auth_users)
      .where(eq(auth_users.id, ctx.session.user.id));
    return res;
  }),
});
