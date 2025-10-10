import { z } from "zod";

export const createBaseInput = z.object({
    name: z.string().min(1).max(80),
});
export type CreateBaseInput = z.infer<typeof createBaseInput>;
