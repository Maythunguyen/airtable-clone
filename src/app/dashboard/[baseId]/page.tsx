"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import TableTabs from "../../_components/TableTab";

export default function BaseTabsPage({ children }: { children: React.ReactNode }) {
    const { baseId } = useParams<{ baseId: string }>();
    const router = useRouter();
    const utils = api.useUtils();

    const { data: tables, isLoading } = api.table.list.useQuery({ baseId });

    const createTable = api.table.createTable.useMutation({
      onSuccess: async () => {
        await utils.table.list.invalidate({ baseId });
        router.push(`/dashboard/${baseId}`);
      },
    });

    const nextName =
      (tables?.length ?? 0) === 0 ? "Table 1" : `Table ${((tables?.length ?? 0) + 1)}`;

    return (
      	<div className="border-b bg-white">
			<TableTabs
				baseId={baseId}
				tables={tables ?? []}
				loading={isLoading}
				creating={createTable.isPending}
				onCreate={() => createTable.mutate({ baseId, name: nextName })}
			/>
				<div className="flex-1 overflow-auto">
				{children}
				</div>
			<div className="p-6 text-sm text-gray-600">
			{isLoading
				? "Loading…"
				: (tables?.length ?? 0) > 0
				? "Pick a table above, or click + to create a new one."
				: "This base has no tables yet. Click + to create one."}
			</div>
      	</div>
    );
}
