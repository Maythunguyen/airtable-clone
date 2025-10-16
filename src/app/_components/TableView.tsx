"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { api } from "~/trpc/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCellKeyboardNav } from "~/hooks/useCellKeyboardNav";
import TableToolBar from "./TableToolBar";




type RowWire = {
	id: string;
	tableId: string;
	data: Record<string, string | number>;
};

// A minimal client-safe column type (avoid importing Prisma types in client)
type UIColumn = {
	id: string;
	name: string;
	type: "TEXT" | "NUMBER";
	position: number;
};

type TableViewProps = {
	baseId: string;
	tableId: string;
};

export default function TableView({ baseId, tableId }: TableViewProps) {
	const utils = api.useUtils();
	const [menuOpen, setMenuOpen] = React.useState(false);
	const [edits, setEdits] = React.useState<Record<string, Record<string, string | number>>>({});
	const [search, setSearch] = React.useState("");

	const updateEdit = React.useCallback(
		(rowId: string, colId: string, value: string | number) => {
			setEdits((prev) => ({
				...prev,
				[rowId]: { ...(prev[rowId] ?? {}), [colId]: value },
			}));
		},
		[]
	);
	//Queries
	const colsQuery = api.table.listColumnsSimple.useQuery({ tableId });

	const rowsQuery = api.table.listRows.useInfiniteQuery(
		{ tableId, limit: 200, search },{ getNextPageParam: (last) => last.nextCursor ?? undefined, staleTime: 10_000,});
	
	
	// Flatten page data
	const items: RowWire[] = React.useMemo(() => {
		if (!rowsQuery.data) return [];
		return rowsQuery.data.pages.flatMap((p) => p.items as RowWire[]);
	}, [rowsQuery.data]);

	// Merge server rows + local edits
	const viewRows: RowWire[] = React.useMemo(
		() =>
		items.map((r) => ({
			...r,
			data: { ...r.data, ...(edits[r.id] ?? {}) },
		})),
		[items, edits]
	);

	// Mutations
	const addRows = api.table.addRows.useMutation({
		onSuccess: async () => {
			await utils.table.listRows.invalidate({ tableId, limit: 200 });
		},
	});
	const handleAddRow = () => addRows.mutate({ tableId, count: 100_000 });

	const addColumn = api.table.addColumn.useMutation({
		onSuccess: async () => {
			await utils.table.listColumnsSimple.invalidate({ tableId });
			await utils.table.listRows.invalidate({ tableId, limit: 100 });
		},
	});

	const handleAddColumn = React.useCallback(
		(type: "TEXT" | "NUMBER") => {
		if (addColumn.isPending) return;
		setMenuOpen(false);

		const position = colsQuery.data?.length ?? 0;
		const baseName = type === "NUMBER" ? "Number" : "Text";

		addColumn.mutate({
			tableId,
			name: `New ${baseName}`,
			type,
			position,
		});
		},
		[addColumn, colsQuery.data, tableId]
	);

	// Arrow navigation
	const nav = useCellKeyboardNav({
		getTotalCols: () => dynamicDataCols.length + 2,
		getRowCount: () => viewRows.length,
		onReachEndRow: async () => {
			if (rowsQuery.hasNextPage && !rowsQuery.isFetchingNextPage) {
					await rowsQuery.fetchNextPage();
			}
		},
	});

	// Dynamic column defs (built from server columns)
	const makeCell = React.useCallback(
		(col: UIColumn, colIndex: number): ColumnDef<RowWire> => ({
			id: col.id,
			header: col.name,
			accessorFn: (row) => row.data[col.id],
			cell: ({ row, getValue }) => {
				const v = getValue<string | number>();
				const display = v ?? (col.type === "NUMBER" ? 0 : ""); // default for empty values
				return (
					<input
						className="w-full bg-transparent outline-none"
						{...nav.getCellProps(row.index, colIndex)}
						value={String(display)}
						onChange={(e) => {
						const next =
							col.type === "NUMBER"
							? Number(e.target.value || 0)
							: e.target.value;
						updateEdit(row.original.id, col.id, next);
						}}
						placeholder={col.name}
						inputMode={col.type === "NUMBER" ? "numeric" : undefined}
					/>
				);
			},
		}),
		[nav, updateEdit]
	);

	const dynamicDataCols = React.useMemo<ColumnDef<RowWire, unknown>[]>(() => {
		const cols = (colsQuery.data ?? []) as UIColumn[];
		return cols.map((c, i) => makeCell(c, i));
	}, [colsQuery.data, makeCell]);

	// Row index column
	const indexCol: ColumnDef<RowWire> = React.useMemo(
		() => ({
			id: "#",
			header: "#",
			size: 56,
			cell: (ctx) => ctx.row.index + 1,
		}),
		[]
	);

	// + button column
	const plusCol: ColumnDef<RowWire> = React.useMemo(
		() => ({
			id: "__add_col",
			size: 56,
			enableSorting: false,
			enableResizing: false,
			header: () => (
				<div className="relative">
					<button
						aria-label="Add field"
						className="grid h-10 w-12 place-items-center rounded hover:bg-gray-50 disabled:opacity-50"
						onClick={() => setMenuOpen((v) => !v)}
						disabled={addColumn.isPending}
					>
						{addColumn.isPending ? "…" : "+"}
					</button>
					{menuOpen && (
						<div
							className="absolute right-0 z-20 mt-2 w-40 rounded border bg-white shadow"
							onMouseLeave={() => setMenuOpen(false)}
						>
							<button
								className="block w-full px-3 py-2 text-left hover:bg-gray-100"
								onClick={() => handleAddColumn("TEXT")}
							>
								Text
							</button>
							<button
								className="block w-full px-3 py-2 text-left hover:bg-gray-100"
								onClick={() => handleAddColumn("NUMBER")}
							>
								Number
							</button>
						</div>
					)}
				</div>
			),
			cell: () => null,
		}),
		[addColumn.isPending, handleAddColumn, menuOpen]
	);

	const columns = React.useMemo<ColumnDef<RowWire, unknown>[]>(
		() => [indexCol, ...dynamicDataCols, plusCol],
		[indexCol, dynamicDataCols, plusCol]
	);


	const table = useReactTable({
		data: viewRows,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	// Virtualization setup
	const parentRef = React.useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: viewRows.length + (rowsQuery.hasNextPage ? 1 : 0),
		getScrollElement: () => parentRef.current,
		estimateSize: () => 40,
		overscan: 10,
	});

	

	//Infinite scroll trigger
	React.useEffect(() => {
		const virtualItems = rowVirtualizer.getVirtualItems();
		if (virtualItems.length === 0) return;

		const lastItem = virtualItems[virtualItems.length - 1];
		if (
			lastItem?.index !== undefined && lastItem.index >= viewRows.length - 1 &&
			rowsQuery.hasNextPage &&
			!rowsQuery.isFetchingNextPage
		) {
			void rowsQuery.fetchNextPage();
		}
		}, [
		rowVirtualizer.getVirtualItems(), // reacts to visible items
		viewRows.length,                  // total rows rendered
		rowsQuery.hasNextPage,
		rowsQuery.isFetchingNextPage,
	]);

	// Reset rows if search or tableId changes
	React.useEffect(() => {
		void utils.table.listRows.reset({ tableId, limit: 200, search });
	}, [search, tableId, utils]);



	return (
		<div className="bg-white">
			<TableToolBar
				search={search}
				setSearch={(v) => setSearch(v)}
			/>
			<div className="overflow-x-auto">
				<table className="min-w-full border-collapse text-sm">
					<thead className="bg-gray-50 text-gray-600">
						{table.getHeaderGroups().map((hg) => (
							<tr key={hg.id}>
								{hg.headers.map((header) => (
									<th key={header.id} className="border px-3 py-2 text-left">
										{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
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
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>

					<tfoot>
						<tr>
							<td
								colSpan={table.getAllColumns().length}
								className="border px-3 py-2"
							>
								<button
									type="button"
									onClick={handleAddRow}
									disabled={addRows.isPending}
									className="rounded px-3 py-3 text-sm hover:bg-gray-50  hover:text-gray-600 disabled:opacity-50 cursor-pointer bg-blue-400 text-white"
									title="Add 1 row"
								>
									{addRows.isPending ? "Adding…" : "+ 100k"}
								</button>
							</td>
						</tr>
					</tfoot>
				</table>
				
				<div className="flex items-center gap-2 m-auto justify-center my-6">
					{rowsQuery.hasNextPage && (
						<button
							type="button"
							onClick={() => rowsQuery.fetchNextPage()}
							disabled={rowsQuery.isFetchingNextPage}
							className="rounded border px-3 py-3 text-sm hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 bg-blue-400 text-white"
							title="Load more"
						>
							{rowsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
						</button>
					)}
				</div>

				{rowsQuery.isLoading && (
					<div className="p-3 text-sm text-gray-500">Loading…</div>
				)}
			</div>
		</div>
	);
};
