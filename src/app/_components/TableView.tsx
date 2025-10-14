"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { api } from "~/trpc/react";

// ===== Types =====
type RowWire = {
  id: string;
  tableId: string;
  // IMPORTANT: keys are columnIds (string), values are the cell values
  data: Record<string, string | number>;
};

// A minimal client-safe column type (avoid importing Prisma types in client)
type UIColumn = {
  id: string;
  name: string;
  type: "TEXT" | "NUMBER";
  position: number;
};

// ===== Component =====
type TableViewProps = {
  baseId: string;
  tableId: string;
};

export default function TableView({ baseId, tableId }: TableViewProps) {
  const utils = api.useUtils();

  const [menuOpen, setMenuOpen] = React.useState(false);

  // Local edit buffer: rowId -> { [columnId]: value }
  const [edits, setEdits] = React.useState<
    Record<string, Record<string, string | number>>
  >({});

  const updateEdit = React.useCallback(
    (rowId: string, colId: string, value: string | number) => {
      setEdits((prev) => ({
        ...prev,
        [rowId]: { ...(prev[rowId] ?? {}), [colId]: value },
      }));
    },
    []
  );

  // ===== Queries =====
  const colsQuery = api.table.listColumnsSimple.useQuery({ tableId });

  const rowsQuery = api.table.listRows.useInfiniteQuery(
    { tableId, limit: 100 },
    {
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      staleTime: 5_000,
    }
  );

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

  // ===== Mutations =====
  const addRows = api.table.addRows.useMutation({
    onSuccess: async () => {
      await utils.table.listRows.invalidate({ tableId, limit: 100 });
    },
  });
  const handleAddRow = () => addRows.mutate({ tableId, count: 1 });

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

  // ===== Dynamic column defs (built from server columns) =====
  const makeCell = React.useCallback(
    (col: UIColumn): ColumnDef<RowWire> => ({
      id: col.id,
      header: col.name,
      accessorFn: (row) => row.data[col.id],
      cell: ({ row, getValue }) => {
        const v = getValue<string | number>();
        const display =
          v ?? (col.type === "NUMBER" ? 0 : ""); // default for empty values
        return (
          <input
            className="w-full bg-transparent outline-none"
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
    [updateEdit]
  );

  const dynamicDataCols = React.useMemo<ColumnDef<RowWire, unknown>[]>(() => {
    const cols = (colsQuery.data ?? []) as UIColumn[];
    return cols.map((c) => makeCell(c));
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

  return (
    <div className="border border-r bg-white">
      <div className="flex items-center justify-between border-b px-3 pb-2">
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
                  className="rounded px-1 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                  title="Add 1 row"
                >
                  +
                </button>
              </td>
            </tr>
          </tfoot>
        </table>

        {rowsQuery.isLoading && (
          <div className="p-3 text-sm text-gray-500">Loading…</div>
        )}
      </div>
    </div>
  );
}
