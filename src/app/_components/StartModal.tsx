"use client";

import React, { useEffect, useRef } from "react";

type Props = {
	open: boolean;
	onClose: () => void;
	onCreateBase: () => void; 
	workspaceName?: string; 
};

export default function StartModal({
	open,
	onClose,
	onCreateBase,
}: Props) {
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	useEffect(() => {
		if (open) dialogRef.current?.focus();
	}, [open]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center"
			aria-modal="true"
			role="dialog"
			aria-labelledby="start-modal-title"
		>
		<div
			className="absolute inset-0 bg-black/40"
			onClick={onClose}
		/>
			<div
				ref={dialogRef}
				tabIndex={-1}
				className="relative z-[101] mx-3 w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
			>
				<div className="flex items-center justify-between border-b px-6 py-4">
					<h2 id="start-modal-title" className="text-xl font-semibold">
						How do you want to start?
					</h2>
					<button
						aria-label="Close"
						onClick={onClose}
						className="rounded p-1 text-gray-500 hover:bg-gray-100"
					>
						×
					</button>
				</div>
				<div className="px-6 pt-3 pb-1 text-sm">
					<span className="font-semibold text-gray-700">Workspace: 5</span>{" "}
					<span className="ml-1 select-none text-gray-400">▾</span>
				</div>

				<div className="p-6">
					<button
						type="button"
						onClick={onCreateBase}
						className="rounded-xl border bg-white text-left transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
					>
						<div className="rounded-t-xl bg-blue-50 p-6">
							<div className="h-28 rounded-lg bg-white shadow-inner" />
						</div>
						<div className="space-y-1 p-5">
							<h3 className="text-base font-semibold">Build an app on your own</h3>
							<p className="text-sm text-gray-600">
								Start with a blank app and build your ideal workflow.
							</p>
						</div>
					</button>
				</div>
			</div>
		</div>
	);
}
