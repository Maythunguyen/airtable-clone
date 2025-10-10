export type ColumnType = "TEXT" | "NUMBER";

// Minimal DTOs used on the client (Prisma types can also be imported where available)
export interface BaseDTO {
    id: string;
    name: string;
    createdAt: string; // ISO; serialize Date for client
}

export interface ColumnDTO {
    id: string;
    tableId: string;
    name: string;
    type: ColumnType;
    position: number;
}

export interface RowDTO {
    id: string;
    tableId: string;
    data: Record<string, unknown>; // JSONB of { [columnId]: value }
    createdAt: string;
}
