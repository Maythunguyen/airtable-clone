import { z } from "zod";

const FilterOpText = z.enum(["is_empty", "is_not_empty", "contains", "not_contains", "eq", "neq"]);
const FilterOpNum  = z.enum(["eq","neq","gt","gte","lt","lte","is_empty","is_not_empty"]);

export const ViewFilterSchema = z.object({
    columnId: z.string().min(1),
    type: z.enum(["TEXT","NUMBER"]),
    op: z.union([FilterOpText, FilterOpNum]),
    value: z.union([z.string(), z.number()]).optional(), // empty/not_empty don’t need value
});

export const ViewSortSchema = z.object({
    columnId: z.string().min(1),
    type: z.enum(["TEXT","NUMBER"]),
    dir: z.enum(["asc","desc"]).default("asc"),
    nullsLast: z.boolean().optional(),
});

export const ViewConfigSchema = z.object({
    search: z.string().max(200).optional(),
    filters: z.array(ViewFilterSchema).optional(),
    sort: ViewSortSchema.optional(),
    hiddenColumnIds: z.array(z.string()).optional(),
});
