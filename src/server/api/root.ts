import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { uploadRouter } from "./routers/upload";
import { userRouter } from "./routers/user";
import { transactionsRouter } from "./routers/transactions";
import { deleteRouter } from "./routers/delete";
import { tagsRouter } from "./routers/tags";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  delete: deleteRouter,
  upload: uploadRouter,
  user: userRouter,
  transactions: transactionsRouter,
  tags: tagsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
