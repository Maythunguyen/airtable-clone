import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  listTablesInput,
  createTableInput,
  deleteTableInput,
  deleteColumnInput,
  tableOutput,
  columnOutput,
  tableWithColumnsOutput,
} from "~/schemas/table";
import { z } from "zod";
import { faker } from "@faker-js/faker";
import { addRowsInput } from "~/schemas/row";
import { AddColumnsInput } from "~/schemas/column";
import { PrismaClient } from "@prisma/client";
import type { Prisma, Column } from "@prisma/client";
type JsonValue  = Prisma.JsonValue;
type JsonObject = Prisma.JsonObject;
type InputJson  = Prisma.InputJsonValue;

// helper to fetch columns (we seed JSON keyed by columnId)
async function getColumnsByTable(db: PrismaClient, tableId: string) {
    const cols: Column[] = await db.column.findMany({
        where: { tableId },
        orderBy: { position: "asc" },
    });

    const byName: Record<string, Column> = Object.fromEntries(cols.map((c) => [c.name, c]));

    return { cols, byName };
}

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
                { tableId: table.id, name: "Name",        type: "TEXT", position: 0 },
                { tableId: table.id, name: "Notes",       type: "TEXT", position: 1 },
                { tableId: table.id, name: "Assignee",    type: "TEXT", position: 2 },
                { tableId: table.id, name: "Status",      type: "TEXT", position: 3 },
                { tableId: table.id, name: "Attachments", type: "TEXT", position: 4 },
                ],
            });

            const createdCols = await tx.column.findMany({
                where: { tableId: table.id },
                orderBy: { position: "asc" },
            });
            
            const byName = Object.fromEntries(createdCols.map(c => [c.name, c.id])) as Record<string, string>;
            const colId = (name: string) => byName[name]!;
            const rows = Array.from({ length: 5 }).map(() => ({
                tableId: table.id,
                data: {
                    [colId("Name")]: faker.commerce.productName(),
                    [colId("Notes")]: faker.lorem.sentence(),
                    [colId("Assignee")]: `${faker.person.firstName()} ${faker.person.lastName()}`,
                    [colId("Status")]: faker.helpers.arrayElement(["To Do", "In Progress", "Done"]),
                    [colId("Attachments")]: "—",
                } as Prisma.InputJsonValue,
            }));
                await tx.row.createMany({ data: rows });

                return table;
            });

            return result;
        }),

    addRows: protectedProcedure
        .input(addRowsInput)
        .mutation(async ({ ctx, input }) => {
            // verify owner
            const table = await ctx.db.table.findFirstOrThrow({
                where: { id: input.tableId, base: { ownerId: ctx.session.user.id } },
                include: { base: true },
            });

            const { byName } = await getColumnsByTable(ctx.db, table.id);
            const mkRowData = (): Record<string, string | number> => {
                const getId = (name: string) => byName[name]?.id ?? "";
                return {
                    [getId("Name")]: faker.commerce.productName(),
                    [getId("Notes")]: faker.commerce.productDescription(),
                    [getId("Assignee")]: `${faker.person.firstName()} ${faker.person.lastName()}`,
                    [getId("Status")]: faker.helpers.arrayElement(["To Do", "In Progress", "Done"]),
                    [getId("Attachments")]: "—",
                };
            };
            const CHUNK = 5_000;
            let remaining = input.count;

            while (remaining > 0) {
                const n = Math.min(CHUNK, remaining);
                const data = Array.from({ length: n }, () => ({
                tableId: table.id,
                data: mkRowData(),
                }));
                await ctx.db.row.createMany({ data });
                remaining -= n;
            }

            return { success: true,  count: input.count };
        }),
    
    listRows: protectedProcedure
        .input(
        // simple keyset pagination by (tableId, id)
        // add optional sort/filter/search later and push down to SQL
            z.object({
                tableId: z.string().min(1),
                limit: z.number().int().min(1).max(500).default(100),
                cursor: z.string().nullish(), // last seen row.id
            })
        )
        .query(async ({ ctx, input }) => {
            const where = { tableId: input.tableId };
            const take = input.limit + 1;

            const rows = await ctx.db.row.findMany({
                where,
                take,
                ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
                orderBy: { id: "asc" },
            });

            let nextCursor: string | undefined = undefined;
            if (rows.length > input.limit) {
                const next = rows.pop()!;
                nextCursor = next.id;
            }
            return { items: rows, nextCursor };
        }),


    deleteTable: protectedProcedure
        .input(deleteTableInput)
        .output(z.object({ success: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.table.delete({ where: { id: input.id } });
        return { success: true };
        }),

    listColumns: protectedProcedure
        .input(
        // simple keyset pagination by (tableId, id)
        // add optional sort/filter/search later and push down to SQL
            z.object({
                tableId: z.string().min(1),
                limit: z.number().int().min(1).max(500).default(100),
                cursor: z.string().nullish(), // last seen column.id
            })
        )
        .query(async ({ ctx, input }) => {
            const where = { tableId: input.tableId };
            const take = input.limit + 1;

            const columns = await ctx.db.column.findMany({
                where,
                take,
                ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
                orderBy: { id: "asc" },
            });

            let nextCursor: string | undefined = undefined;
            if (columns.length > input.limit) {
                const next = columns.pop()!;
                nextCursor = next.id;
            }
            return { items: columns, nextCursor };
        }),
    
        listColumnsSimple: protectedProcedure
            .input(z.object({ tableId: z.string().min(1) }))
            .query(({ ctx, input }) =>
                ctx.db.column.findMany({
                where: { tableId: input.tableId },
                orderBy: { position: "asc" },
                })
            ),


    addColumn: protectedProcedure
        .input(AddColumnsInput)
        .output(columnOutput)
        .mutation(async ({ ctx, input }) => {
            const { tableId, name, type, position } = input;

            return await ctx.db.$transaction(
                async (tx) => {
                    const col = await tx.column.create({
                        data: { tableId, name, type, position },
                    });

                    const defaultValue = type === "NUMBER" ? 0 : "";

                    // Single statement: add/overwrite the new key for ALL rows in this table
                    await tx.$executeRaw`
                    UPDATE "Row"
                    SET "data" = ("data"::jsonb) || jsonb_build_object(${col.id}, ${defaultValue})
                    WHERE "tableId" = ${tableId}
                    `;

                    return col;
                },
                { timeout: 20_000, maxWait: 10_000 }
                );
        }),
    deleteColumn: protectedProcedure
        .input(deleteColumnInput)
        .output(z.object({ success: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.column.delete({ where: { id: input.id } });
        return { success: true };
    }),
});
