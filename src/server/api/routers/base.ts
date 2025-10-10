import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createBaseInput, deleteBaseInput } from "~/schemas/base";

export const baseRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.base.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    })
  ),

  create: protectedProcedure
    .input(createBaseInput)
    .mutation(({ ctx, input }) =>
      ctx.db.base.create({
        data: { name: input.name, ownerId: ctx.session.user.id },
      })
    ),

  deleteBase: protectedProcedure
    .input(deleteBaseInput)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.base.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
