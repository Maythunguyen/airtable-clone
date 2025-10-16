"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { PiUsersThree } from "react-icons/pi";
import { PiShare } from "react-icons/pi";
import { GoHome } from "react-icons/go";
import { cn } from "~/lib/utils";
import { SidebarWithWorkspaces } from "./WorkSpaceDashboard";
import Star from "~/components/icons/Star";

export function SidebarDemo() {

	const links = [
		{
			label: "Home",
			href: "/dashboard",
			icon: <GoHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
		},
		{
			label: "Starred",
			href: "#",
			icon: <Star className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
		},
		{
			label: "Shared",
			href: "#",
			icon: <PiShare className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
		},
		{
			label: "Workspaces",
			onClick: () => setOpen(true),
			icon: <PiUsersThree className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
		},
	];

	const [open, setOpen] = useState<boolean>(false);

	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
				"min-h-screen",
			)}
		>
			<Sidebar open={open} setOpen={setOpen}>
				<SidebarBody className="justify-between gap-10">
					<div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
						<div className="mt-8 flex flex-col gap-2">
							{links.map((link) => (
								<SidebarLink key={link.label} link={link} />
							))}
						</div>
					</div>
				</SidebarBody>
			</Sidebar>
			<SidebarWithWorkspaces />
		</div>
	);
};
