export type TextFilterOp = "contains" | "not_contains" | "is_empty" | "not_empty" | "eq";
export type NumberFilterOp = "gt" | "lt" | "eq";

export type ColumnFilter =
	| { columnId: string; kind: "text"; op: TextFilterOp; value?: string }
	| { columnId: string; kind: "number"; op: NumberFilterOp; value?: number };

export type SortSpec =
	| { columnId: string; kind: "text"; dir: "asc" | "desc" }
	| { columnId: string; kind: "number"; dir: "asc" | "desc" };

export interface ViewConfig {
	filters: ColumnFilter[];
	sort?: SortSpec;
	search?: string;
	visibleColumns?: string[];
}
