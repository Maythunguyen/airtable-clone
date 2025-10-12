import { z } from "zod";

export const addRowsInput = z.object({
    tableId: z.string().min(1),
    count: z.number().int().positive().max(1_000_000),
});
export type AddRowsInput = z.infer<typeof addRowsInput>;