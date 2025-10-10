"use client";

import { api } from "~/trpc/react";
import { useState } from "react";

export default function DashboardPage() {
  const utils = api.useUtils();
  const [name, setName] = useState("");

  const { data: bases, isLoading } = api.base.list.useQuery();
  const createBase = api.base.create.useMutation({
    onSuccess: () => { utils.base.list.invalidate(); setName(""); },
  });
  const delBase = api.base.delete.useMutation({
    onSuccess: () => utils.base.list.invalidate(),
  });

  return (
    <div className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Your Bases</h1>

      <div className="flex gap-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="New base name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={!name || createBase.isPending}
          onClick={() => createBase.mutate({ name })}
        >
          {createBase.isPending ? "Creating…" : "Add"}
        </button>
      </div>

      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <ul className="space-y-3">
          {bases?.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded border bg-white p-3">
              <a className="font-medium hover:underline" href={`/dashboard/${b.id}`}>{b.name}</a>
              <button className="text-sm text-red-500 hover:underline" onClick={() => delBase.mutate({ id: b.id })}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
