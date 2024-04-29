import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const userCredits = await ctx.db
      .from("user_data")
      .select("credits")
      .eq("id", ctx.user.id)
      .single();

    return {
      credits: userCredits.data,
      user: await ctx.db.auth.getUser(),
    };
  }),
});
