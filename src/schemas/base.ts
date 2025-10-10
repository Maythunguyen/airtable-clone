import { z } from "zod";

export const createBaseInput = z.object({
    name: z.string().min(1).max(80),
});

export const deleteBaseInput = z.object({
    id: z.string().min(1),
});

export const baseOutput = z.object({
    id: z.string(),
    name: z.string(),
    ownerId: z.string(),
    createdAt: z.date(),
});
export type BaseOutput = z.infer<typeof baseOutput>;
