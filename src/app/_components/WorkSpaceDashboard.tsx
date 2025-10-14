"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { IconChevronDown } from "@tabler/icons-react";
import StartModal from "./StartModal";


export function SidebarWithWorkspaces() {
	const router = useRouter();
	const utils = api.useUtils();

	const [openModal, setOpenModal] = useState<boolean>(false);

	const { data: bases, isLoading } = api.base.list.useQuery();

	const createBase = api.base.createBase.useMutation({
		onSuccess: async (base) => {
			await utils.base.list.invalidate();
			router.push(`/dashboard/${base.id}`);
		},
	});

	const delBase = api.base.deleteBase.useMutation({
		onSuccess: async () => {
			await utils.base.list.invalidate();
		},
	});

	const handleCreate = () => {
		setOpenModal(true);
	}

	return (
		<div className="flex flex-1">
			<div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
				<div className="px-6 py-8 space-y-8">
					<section className="space-y-3">
						<div className="mb-4 flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold uppercase text-gray-500">Workspace 5</h3>
						</div>
						<div className="flex items-center gap-2">
							<button onClick={handleCreate} className="rounded bg-blue-600 px-4 py-2 text-white">Create</button>
							<button className="rounded border px-4 py-2">Share</button>
							<button className="rounded border px-4 py-2">...</button>
						</div>

						</div>
						<div className="mb-4 flex items-center justify-start gap-2 text-sm font-medium">
						<p className="text-sm text-gray-500">Last opened </p>
						<IconChevronDown className="h-5 w-5 text-gray-500" />
						</div>
						
						{isLoading ? (
						<div className="text-gray-500">Loading…</div>
						) : (
							<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{bases?.map((b) => (
									<li key={b.id} className="rounded-lg border bg-white p-6">
										<div className="flex items-center justify-between">
											<a className="font-medium hover:underline" href={`/dashboard/${b.id}`}>
												{b.name}
											</a>
											<button
												className="text-xs text-red-500 hover:underline"
												onClick={() => delBase.mutate({ id: b.id })}
											>
												Delete
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>
			</div>
			<StartModal open={openModal} onClose={() => setOpenModal(false)} onCreateBase={() => createBase.mutate({ name: "Untitled Base" })} />
		</div>
	);
}
