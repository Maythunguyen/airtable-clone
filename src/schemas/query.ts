import { z } from "zod";
import { sortSpec, columnFilter } from "./view";

export const listRowsInput = z.object({
    tableId: z.string().cuid(),
    cursor: z
        .object({
        // Use tuple for seek-based pagination: sortKey + id
        id: z.string().cuid(),
        // optional: include current sort key value for stable seek
        sortValue: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
    limit: z.number().int().min(1).max(500).default(100),
    search: z.string().optional(),
    filters: z.array(columnFilter).default([]),
    sort: sortSpec.optional(),
});
export type ListRowsInput = z.infer<typeof listRowsInput>;
