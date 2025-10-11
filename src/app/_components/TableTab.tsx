"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import TableView from "./TableView";

type Table = { id: string; name: string };

type Props = {
	baseId: string;
	tables: Table[];
	loading?: boolean;
	creating?: boolean;
	onCreate: () => void; 
};

export default function TableTabs({
	baseId,
	tables,
	loading,
	creating,
	onCreate,
}: Props) {
	const router = useRouter();
	const qs = useSearchParams();
	const initial = qs.get("table") ?? tables[0]?.id ?? "none";
	const [active, setActive] = React.useState(initial);

	React.useEffect(() => {
		// keep active in sync as tables load/change
		if (!tables.length) return;
		if (!tables.find((t) => t.id === active)) {
			setActive(tables[0]!.id);
		}
	}, [tables, active]);

	const onChange = (val: string) => {
		setActive(val);
		router.replace(`/dashboard/${baseId}?table=${encodeURIComponent(val)}`, { scroll: false });
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center gap-2 border-b bg-white px-3 py-2">
				<Tabs value={active} onValueChange={onChange} className="flex-1">
					<TabsList className="flex items-center gap-1 bg-transparent p-0">
						{loading ? (
							<div className="h-8 w-24 animate-pulse rounded bg-gray-100" />
							) : (
								<>
									{tables.map((t) => (
									<TabsTrigger
										key={t.id}
										value={t.id}
										className="rounded-md border px-3 py-1.5 text-sm data-[state=active]:bg-gray-100"
									>
										{t.name}
									</TabsTrigger>
									))}
								</>
						)}
						{/* + as a BUTTON (not a Tab) to avoid value changes */}
						<button
							type="button"
							onClick={onCreate}
							disabled={creating}
							className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
							title="Create table"
						>
							+
						</button>
					</TabsList>

					{tables.map((t) => (
						<TabsContent key={t.id} value={t.id} className="flex-1 overflow-hidden">
							<TableView baseId={baseId} tableId={t.id} />
						</TabsContent>
					))}
				</Tabs>
			</div>
		</div>
	);
}
