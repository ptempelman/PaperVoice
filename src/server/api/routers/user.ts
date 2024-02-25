import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({

    credits: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const numCredits = await ctx.db.user.findUnique({
                where: { id: input.id },
                select: { credits: true },
            });
            return {
                credits: numCredits?.credits ?? 0,
            };
        }),
});