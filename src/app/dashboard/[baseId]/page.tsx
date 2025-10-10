"use client";

import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function BaseDetailPage() {
  const { baseId } = useParams<{ baseId: string }>();
  const utils = api.useUtils();
  const [name, setName] = useState("");

  const { data: tables, isLoading } = api.table.list.useQuery({ baseId });
  const createTable = api.table.create.useMutation({
    onSuccess: async () => { await utils.table.list.invalidate(); setName(""); },
  });
  const delTable = api.table.delete.useMutation({
    onSuccess: async () => { await utils.table.list.invalidate(); },
  });

  return (
    <div className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Tables</h1>

      <div className="flex gap-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="New table name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={!name || createTable.isPending}
          onClick={() => createTable.mutate({ baseId, name })}
        >
          {createTable.isPending ? "Creating…" : "Add"}
        </button>
      </div>

      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <ul className="space-y-3">
          {tables?.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded border bg-white p-3">
              <span>{t.name}</span>
              <button className="text-sm text-red-500 hover:underline" onClick={() => delTable.mutate({ id: t.id })}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
