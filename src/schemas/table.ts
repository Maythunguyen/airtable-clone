import { z } from "zod";

export const createTableInput = z.object({
    baseId: z.string().cuid(),
    name: z.string().min(1).max(80),
});
export type CreateTableInput = z.infer<typeof createTableInput>;

export const createColumnInput = z.object({
    tableId: z.string().cuid(),
    name: z.string().min(1).max(80),
    type: z.enum(["TEXT", "NUMBER"]),
    position: z.number().int().nonnegative(),
});
export type CreateColumnInput = z.infer<typeof createColumnInput>;

export const upsertCellInput = z.object({
    rowId: z.string().cuid(),
    columnId: z.string().cuid(),
    // value can be string or number for now
    value: z.union([z.string(), z.number(), z.null()]).optional(),
});
export type UpsertCellInput = z.infer<typeof upsertCellInput>;

export const bulkInsertRowsInput = z.object({
    tableId: z.string().cuid(),
    rows: z.array(z.record(z.string().cuid(), z.union([z.string(), z.number(), z.null()]).optional())),
    // rows = [{ "<columnId>": value, ... }, ...]
});
export type BulkInsertRowsInput = z.infer<typeof bulkInsertRowsInput>;
