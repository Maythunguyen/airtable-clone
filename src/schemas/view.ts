import { z } from "zod";

export const textFilterOp = z.enum(["contains", "not_contains", "is_empty", "not_empty", "eq"]);
export const numberFilterOp = z.enum(["gt", "lt", "eq"]);

export const columnFilter = z.discriminatedUnion("kind", [
    z.object({
        kind: z.literal("text"),
        columnId: z.string().cuid(),
        op: textFilterOp,
        value: z.string().optional(),
    }),
    z.object({
        kind: z.literal("number"),
        columnId: z.string().cuid(),
        op: numberFilterOp,
        value: z.number().optional(),
    }),
]);

export const sortSpec = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("text"), columnId: z.string().cuid(), dir: z.enum(["asc", "desc"]) }),
    z.object({ kind: z.literal("number"), columnId: z.string().cuid(), dir: z.enum(["asc", "desc"]) }),
]);

export const viewConfig = z.object({
    filters: z.array(columnFilter),
    sort: sortSpec.optional(),
    search: z.string().optional(),
    visibleColumns: z.array(z.string().cuid()).optional(),
});
export type ViewConfigInput = z.infer<typeof viewConfig>;

export const saveViewInput = z.object({
    tableId: z.string().cuid(),
    name: z.string().min(1).max(80),
    config: viewConfig,
});
export type SaveViewInput = z.infer<typeof saveViewInput>;
