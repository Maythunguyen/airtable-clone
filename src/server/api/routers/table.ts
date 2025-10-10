import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  listTablesInput,
  createTableInput,
  deleteTableInput,
  createColumnInput,
  deleteColumnInput,
  tableOutput,
  columnOutput,
  tableWithColumnsOutput,
} from "~/schemas/table";
import { z } from "zod";

export const tableRouter = createTRPCRouter({
    list: protectedProcedure
        .input(listTablesInput)
        .output(z.array(tableWithColumnsOutput))
        .query(async ({ ctx, input }) => {
        const tables = await ctx.db.table.findMany({
            where: { baseId: input.baseId, base: { ownerId: ctx.session.user.id } },
            include: { columns: true },
            orderBy: { createdAt: "desc" },
        });
        return tables;
        }),

    create: protectedProcedure
        .input(createTableInput)
        .output(tableOutput)
        .mutation(async ({ ctx, input }) => {
        // Optionally verify user owns the base
        const table = await ctx.db.table.create({
            data: { baseId: input.baseId, name: input.name },
        });
        return table;
        }),

    delete: protectedProcedure
        .input(deleteTableInput)
        .output(z.object({ success: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.table.delete({ where: { id: input.id } });
        return { success: true };
        }),

    addColumn: protectedProcedure
        .input(createColumnInput)
        .output(columnOutput)
        .mutation(async ({ ctx, input }) => {
        const column = await ctx.db.column.create({
            data: {
            tableId: input.tableId,
            name: input.name,
            type: input.type,
            position: input.position,
            },
        });
        return column;
        }),

    deleteColumn: protectedProcedure
        .input(deleteColumnInput)
        .output(z.object({ success: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.column.delete({ where: { id: input.id } });
        return { success: true };
        }),
});
