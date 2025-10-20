import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { ViewConfigSchema } from "~/schemas/view";

export const tableViewRouter = createTRPCRouter({
  // Create view
    createView: protectedProcedure
        .input(z.object({
            tableId: z.string().min(1),
            name: z.string().min(1).max(100),
            config: ViewConfigSchema,
        }))
        .mutation(async ({ ctx, input }) => {
        // owner check via table → base.ownerId
            await ctx.db.table.findFirstOrThrow({ where: { id: input.tableId, base: { ownerId: ctx.session.user.id } },});

            return ctx.db.tableView.create({
                data: {
                    tableId: input.tableId,
                    name: input.name,
                    searchText: input.config.search ?? null,
                    filtersJson: input.config.filters ?? [],
                    sortJson: input.config.sort ?? null,
                    hiddenColumnIds: input.config.hiddenColumnIds ?? [],
                },
            });
        }),

    // Update view
    updateView: protectedProcedure
        .input(z.object({
            id: z.string().min(1),
            name: z.string().min(1).max(100).optional(),
            config: ViewConfigSchema.optional(),
        }))
        .mutation(async ({ ctx, input }) => {
        // ensure ownership
            const view = await ctx.db.tableView.findFirstOrThrow({
                where: { id: input.id, table: { base: { ownerId: ctx.session.user.id } } },
                include: { table: true },
            });

            return ctx.db.tableView.update({
                where: { id: view.id },
                data: {
                ...(input.name ? { name: input.name } : {}),
                ...(input.config
                    ? {
                        searchText: input.config.search ?? null,
                        filtersJson: input.config.filters ?? [],
                        sortJson: input.config.sort ?? null,
                        hiddenColumnIds: input.config.hiddenColumnIds ?? [],
                    }
                    : {}),
                },
            });
        }),

    // Delete view
    delete: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
        // optional: ownership check
        await ctx.db.tableView.findFirstOrThrow({
            where: { id: input.id, table: { base: { ownerId: ctx.session.user.id } } },
        });
        await ctx.db.tableView.delete({ where: { id: input.id } });
        return { success: true };
        }),

    // List by table
    listByTable: protectedProcedure
        .input(z.object({ tableId: z.string().min(1) }))
        .query(({ ctx, input }) => {
        return ctx.db.tableView.findMany({
            where: { tableId: input.tableId, table: { base: { ownerId: ctx.session.user.id } } },
            orderBy: { createdAt: "asc" },
        });
        }),

    // Get one
    get: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(({ ctx, input }) => {
        return ctx.db.tableView.findFirstOrThrow({
            where: { id: input.id, table: { base: { ownerId: ctx.session.user.id } } },
        });
        }),
});
