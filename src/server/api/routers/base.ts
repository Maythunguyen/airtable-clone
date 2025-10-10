import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createBaseInput, baseOutput } from "~/schemas/base";

export const baseRouter = createTRPCRouter({
    list: protectedProcedure
        .output(z.array(baseOutput))
        .query(({ ctx }) =>
        ctx.db.base.findMany({
            where: { ownerId: ctx.session.user.id },
            orderBy: { createdAt: "desc" },
        }),
        ),

    createBase: protectedProcedure
        .input(createBaseInput)
        .output(baseOutput)
        .mutation(async ({ ctx, input }) => {
        const base = await ctx.db.base.create({
            data: { name: input.name, ownerId: ctx.session.user.id },
        });
        return base;
        }),

    deleteBase: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .output(z.object({ success: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.base.delete({ where: { id: input.id } });
        return { success: true };
    }),
});
