import { z } from "zod";

export const columnType = z.enum(["TEXT", "NUMBER"]);

export const AddColumnsInput = z.object({
  tableId: z.string().min(1),
  name: z.string().min(1).max(100),
  type: columnType,
  position: z.number().int().nonnegative(),
});
