"use client";

import React, { useState } from "react";
import { faker } from "@faker-js/faker";

type Row = {
	id: string;
	name: string;
	notes: string;
	assignee: string;
	status: string;
	attachments: string;
};
type TableViewProps = {
	baseId: string;
	tableId: string;
};

export default function TableView({ baseId, tableId }: TableViewProps) {
	const [rows, setRows] = useState<Row[]>(
		Array.from({ length: 4 }, () => ({
		id: faker.string.uuid(),
		name: faker.commerce.productName(),
		notes: faker.commerce.productDescription(),
		assignee: `${faker.person.firstName()} ${faker.person.lastName()}`,
		status: faker.helpers.arrayElement(["To Do", "In Progress", "Done"]),
		attachments: "—",
		}))
	);

	const addRow = () => {
		setRows([
		...rows,
		{
			id: faker.string.uuid(),
			name: "",
			notes: "",
			assignee: "",
			status: "",
			attachments: "",
		},
		]);
	};

	const handleEdit = (
		id: string,
		field: keyof Row,
		value: string
	) => {
		setRows((prev) =>
		prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
		);
	};

	return (
		<div className="border rounded-md overflow-x-auto bg-white">
			<table className="min-w-full border-collapse text-sm">
				<thead className="bg-gray-50 text-gray-600 font-medium">
					<tr>
						<th className="border px-3 py-2 text-left w-12">#</th>
						<th className="border px-3 py-2 text-left">Name</th>
						<th className="border px-3 py-2 text-left">Notes</th>
						<th className="border px-3 py-2 text-left">Assignee</th>
						<th className="border px-3 py-2 text-left">Status</th>
						<th className="border px-3 py-2 text-left">Attachments</th>
					</tr>
				</thead>
				<tbody>
				{rows.map((row, idx) => (
					<tr key={row.id} className="hover:bg-gray-50">
						<td className="border px-3 py-2">{idx + 1}</td>
						{(["name", "notes", "assignee", "status", "attachments"] as const).map((key) => (
							<td key={key} className="border px-3 py-2">
							<input
								value={row[key]}
								onChange={(e) =>
								handleEdit(row.id, key, e.target.value)
								}
								className="w-full bg-transparent outline-none"
								placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
							/>
							</td>
						))}
					</tr>
				))}
					<tr>
						<td
							colSpan={6}
							className="border px-3 py-2 cursor-pointer text-gray-500 hover:bg-gray-50"
							onClick={addRow}
						>
							+ 
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}