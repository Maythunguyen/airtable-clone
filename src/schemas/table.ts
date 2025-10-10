
import { z } from "zod";

export const listTablesInput = z.object({ baseId: z.string().min(1) });

export const createTableInput = z.object({
  baseId: z.string().min(1),
  name: z.string().min(1, "Table name is required").max(80),
});

export const deleteTableInput = z.object({ id: z.string().min(1) });

export const columnType = z.enum(["TEXT", "NUMBER"]);

export const createColumnInput = z.object({
  tableId: z.string().min(1),
  name: z.string().min(1).max(80),
  type: columnType,
  position: z.number().int().nonnegative(),
});

export const deleteColumnInput = z.object({ id: z.string().min(1) });

export const tableOutput = z.object({
  id: z.string(),
  name: z.string(),
  baseId: z.string(),
  createdAt: z.date(),
});

export const columnOutput = z.object({
  id: z.string(),
  tableId: z.string(),
  name: z.string(),
  type: columnType,
  position: z.number().int(),
  createdAt: z.date(),
});

export const tableWithColumnsOutput = tableOutput.extend({
  columns: z.array(columnOutput),
});
