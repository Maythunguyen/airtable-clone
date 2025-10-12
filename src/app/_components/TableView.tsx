"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { api } from "~/trpc/react";

/** Row coming from the API (Prisma row + JSON data) */
type RowWire = {
	id: string;
	tableId: string;
	// data is JSON like: { Name: string, Notes: string, Assignee: string, Status: string, Attachments: string }
	data: Record<string, string | number>;
};

/** Row we render in the table (flattened & typed) */
export type Row = {
	id: string;
	name: string;
	notes: string;
	assignee: string;
	status: string;
	attachments: string;
};

function mapWireToRow(r: RowWire): Row {
	const d = r.data;
	return {
		id: r.id,
		name: String(d.Name ?? ""),
		notes: String(d.Notes ?? ""),
		assignee: String(d.Assignee ?? ""),
		status: String(d.Status ?? ""),
		attachments: String(d.Attachments ?? "—"),
	};
}

type TableViewProps = {
	baseId: string;
	tableId: string;
};

export default function TableView({ baseId, tableId }: TableViewProps) {
	const utils = api.useUtils();

	/** Load rows with cursor pagination */
	const rowsQuery = api.table.listRows.useInfiniteQuery(
		{ tableId, limit: 100 },
		{
			getNextPageParam: (last) => last.nextCursor ?? undefined,
			staleTime: 5_000,
		},
	);

	const items: Row[] = React.useMemo(() => {
		if (!rowsQuery.data) return [];
		return rowsQuery.data.pages.flatMap((p) => p.items.map(mapWireToRow));
	}, [rowsQuery.data]);

	/** Local edit buffer: rowId -> partial fields */
	const [edits, setEdits] = React.useState<Record<string, Partial<Row>>>({});

	const updateEdit = (rowId: string, key: keyof Row, value: string) => {
		setEdits((prev) => ({
		...prev,
		[rowId]: { ...(prev[rowId] ?? {}), [key]: value },
		}));
	};

	/** Merged view (server rows + local edits) */
	const viewRows: Row[] = React.useMemo(
		() =>
		items.map((r) => ({
			...r,
			...(edits[r.id] ?? {}),
		})),
		[items, edits],
	);

	/** Add a row via server seeding (faker on the server) */
	const addRows = api.table.addRows.useMutation({
		onSuccess: async () => {
		// refresh the first page; or refetch all pages if you prefer
		await utils.table.listRows.invalidate({ tableId, limit: 100 });
		},
	});

	const handleAddRow = () => {
		addRows.mutate({ tableId, count: 1 });
	};

	const columns = React.useMemo<ColumnDef<Row, unknown>[]>(
		() => [
		{
			id: "#",
			header: "#",
			size: 56,
			cell: (ctx) => ctx.row.index + 1,
		},
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row, getValue }) => (
			<input
				className="w-full bg-transparent outline-none"
				value={(getValue<string>() ?? "")}
				onChange={(e) => updateEdit(row.original.id, "name", e.target.value)}
				placeholder="Name"
			/>
			),
		},
		{
			accessorKey: "notes",
			header: "Notes",
			cell: ({ row, getValue }) => (
			<input
				className="w-full bg-transparent outline-none"
				value={(getValue<string>() ?? "")}
				onChange={(e) => updateEdit(row.original.id, "notes", e.target.value)}
				placeholder="Notes"
			/>
			),
		},
		{
			accessorKey: "assignee",
			header: "Assignee",
			cell: ({ row, getValue }) => (
			<input
				className="w-full bg-transparent outline-none"
				value={(getValue<string>() ?? "")}
				onChange={(e) =>
				updateEdit(row.original.id, "assignee", e.target.value)
				}
				placeholder="Assignee"
			/>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row, getValue }) => (
			<input
				className="w-full bg-transparent outline-none"
				value={(getValue<string>() ?? "")}
				onChange={(e) =>
				updateEdit(row.original.id, "status", e.target.value)
				}
				placeholder="Status"
			/>
			),
		},
		{
			accessorKey: "attachments",
			header: "Attachments",
			cell: ({ row, getValue }) => (
			<input
				className="w-full bg-transparent outline-none"
				value={(getValue<string>() ?? "")}
				onChange={(e) =>
				updateEdit(row.original.id, "attachments", e.target.value)
				}
				placeholder="Attachments"
			/>
			),
		},
		],
		[],
	);

	const table = useReactTable({
		data: viewRows,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="rounded-md border bg-white">
			<div className="flex items-center justify-between border-b px-3 py-2">

				<div className="flex items-center gap-2">

				{rowsQuery.hasNextPage && (
					<button
					type="button"
					onClick={() => rowsQuery.fetchNextPage()}
					disabled={rowsQuery.isFetchingNextPage}
					className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
					title="Load more"
					>
					{rowsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
					</button>
				)}
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full border-collapse text-sm">
				<thead className="bg-gray-50 text-gray-600">
					{table.getHeaderGroups().map((hg) => (
						<tr key={hg.id}>
							{hg.headers.map((header) => (
								<th key={header.id} className="border px-3 py-2 text-left">
									{header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>

				<tbody>
					{table.getRowModel().rows.map((r) => (
						<tr key={r.id} className="hover:bg-gray-50">
							{r.getVisibleCells().map((cell) => (
							<td key={cell.id} className="border px-3 py-2 align-top">
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
							))}
						</tr>
					))}
				</tbody>
				<button
					type="button"
					onClick={handleAddRow}
					disabled={addRows.isPending}
					className="rounded px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
					title="Add 1 row"
				>
					+
				</button>
				</table>

				{rowsQuery.isLoading && (
				<div className="p-3 text-sm text-gray-500">Loading…</div>
				)}
			</div>
		</div>
	);
}
