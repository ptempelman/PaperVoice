import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const signinRouter = createTRPCRouter({
    createUser: publicProcedure
        .input(z.object({ id: z.string().nullish(), email: z.string().nullish() }))
        .query(async ({ ctx, input }) => {
            console.log(input.id + " " + input.email)
            console.log("Both", input.id && input.email)
            if (input.id && input.email) {
                console.log("Enter here")
                const existingUser = await ctx.db.user.findUnique({
                    where: { id: input.id },
                });

                console.log("No existing user", !existingUser)

                if (!existingUser) {
                    await ctx.db.user.create({
                        data: { id: input.id, email: input.email, },
                    });
                }
            }
            return { message: 'Sign-in successful' };
        }),
});