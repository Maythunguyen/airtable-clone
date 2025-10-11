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
import { faker } from "@faker-js/faker";

export const tableRouter = createTRPCRouter({
    list: protectedProcedure
        .input(listTablesInput)
        .output(z.array(tableWithColumnsOutput))
        .query(async ({ ctx, input }) => {
        const tables = await ctx.db.table.findMany({
            where: { baseId: input.baseId, base: { ownerId: ctx.session.user.id } },
            include: { columns: true },
            orderBy: { createdAt: "asc" },
        });
        return tables;
        }),

    createTable: protectedProcedure
        .input(createTableInput) 
        .output(tableOutput)
        .mutation(async ({ ctx, input }) => {
        const result = await ctx.db.$transaction(async (tx) => {
            const table = await tx.table.create({
                data: { baseId: input.baseId, name: input.name },
            });

            await tx.column.createMany({
                data: [
                    { tableId: table.id, name: "Name",  type: "TEXT",   position: 0 },
                    { tableId: table.id, name: "Notes", type: "TEXT",   position: 1 },
                    { tableId: table.id, name: "Score", type: "NUMBER", position: 2 },
                ],
            });


            const rows = Array.from({ length: 30 }).map(() => ({
            tableId: table.id,
                data: {
                    Name: faker.person.fullName(),
                    Notes: faker.lorem.sentence(),
                    Score: faker.number.int({ min: 0, max: 100 }),
                },
            }));
            await tx.row.createMany({ data: rows });

            return table;
        });

        return result;
    }),

    deleteTable: protectedProcedure
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
        return ctx.db.column.create({
            data: {
                tableId: input.tableId,
                name: input.name,
                type: input.type,
                position: input.position,
            },
        });
    }),

    deleteColumn: protectedProcedure
        .input(deleteColumnInput)
        .output(z.object({ success: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.column.delete({ where: { id: input.id } });
        return { success: true };
    }),
});
