import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { convertRouter } from "./routers/convert";
import { signinRouter } from "./routers/signin";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  convert: convertRouter,
  user: userRouter,
  signin: signinRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
