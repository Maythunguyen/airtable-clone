import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createBaseInput, baseOutput } from "~/schemas/base";
import { faker } from "@faker-js/faker";
import type { Prisma, Column } from "@prisma/client";

type InputJson = Prisma.InputJsonValue;

export const baseRouter = createTRPCRouter({
    list: protectedProcedure
        .output(z.array(baseOutput))
        .query(({ ctx }) =>
            ctx.db.base.findMany({
                where: { ownerId: ctx.session.user.id },
                orderBy: { createdAt: "desc" },
            })
        ),

    createBase: protectedProcedure
        .input(createBaseInput)
        .output(baseOutput)
        .mutation(async ({ ctx, input }) => {
            const base = await ctx.db.$transaction(async (tx) => {
                // Create base
                    const base = await tx.base.create({
                    data: { name: input.name, ownerId: ctx.session.user.id },
                });

                // Create default table
                const table = await tx.table.create({data: { baseId: base.id, name: "Table 1" },});

                // Create default columns
                await tx.column.createMany({
                    data: [
                        { tableId: table.id, name: "Name",        type: "TEXT", position: 0 },
                        { tableId: table.id, name: "Notes",       type: "TEXT", position: 1 },
                        { tableId: table.id, name: "Assignee",    type: "TEXT", position: 2 },
                        { tableId: table.id, name: "Status",      type: "TEXT", position: 3 },
                        { tableId: table.id, name: "Attachments", type: "TEXT", position: 4 },
                    ],
                });
                // Fetch created columns and map name -> id
                const createdCols: Column[] = await tx.column.findMany({
                    where: { tableId: table.id },
                    orderBy: { position: "asc" },
                });
                const byName = Object.fromEntries(createdCols.map((c) => [c.name, c.id]));

                // Seed 5 faker rows
                const rows = Array.from({ length: 5 }).map(() => {
                const nameId = String(byName["Name"]);
                const notesId = String(byName["Notes"]);
                const assigneeId = String(byName["Assignee"]);
                const statusId = String(byName["Status"]);
                const attachmentsId = String(byName["Attachments"]);

                return {
                    tableId: table.id,
                    data: {
                        [nameId]: faker.commerce.productName(),
                        [notesId]: faker.lorem.sentence(),
                        [assigneeId]: `${faker.person.firstName()} ${faker.person.lastName()}`,
                        [statusId]: faker.helpers.arrayElement(["To Do", "In Progress", "Done"]),
                        [attachmentsId]: "—",
                    } as InputJson,
                };
            });

            await tx.row.createMany({ data: rows });
            return base;
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
