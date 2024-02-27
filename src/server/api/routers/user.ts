import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({

    credits: publicProcedure
        .input(z.object({ id: z.string().nullish() }))
        .query(async ({ ctx, input }) => {
            if (!input.id) {
                return { credits: 0 };
            }

            const numCredits = await ctx.db.user.findUnique({
                where: { id: input.id },
                select: { credits: true },
            });
            return {
                credits: numCredits?.credits ?? 0,
            };
        }),

    subtractCredits: publicProcedure
        .input(z.object({ id: z.string(), amount: z.number().positive() }))
        .mutation(async ({ ctx, input }) => {
            const updatedUser = await ctx.db.user.update({
                where: { id: input.id },
                data: { credits: { decrement: input.amount } },
            });
            return { credits: updatedUser.credits };
        }),

    addCredits: publicProcedure
        .input(z.object({ id: z.string().nullish(), amount: z.number().positive() }))
        .mutation(async ({ ctx, input }) => {
            if (!input.id) {
                return { credits: 0 };
            }
            const updatedUser = await ctx.db.user.update({
                where: { id: input.id },
                data: { credits: { increment: input.amount } },
            });
            return { credits: updatedUser.credits };
        }),

    // get user id by email
    getUserId: publicProcedure
        .input(z.object({ email: z.string().nullish() }))
        .query(async ({ ctx, input }) => {
            if (!input.email) {
                return { id: null };
            }
            const user = await ctx.db.user.findUnique({
                where: { email: input.email },
                select: { id: true },
            });
            return { id: user?.id };
        }),
});