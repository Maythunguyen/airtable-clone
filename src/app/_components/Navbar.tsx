"use client";

import React from 'react';
import Link from "next/link";

export interface NavBarProps {
	showAuthLinks?: boolean;
	signUpHref?: string;
	logInHref?: string;
	bookDemoHref?: string;
	logoHref?: string;
}

const NavBar = ({
	showAuthLinks = true,
	signUpHref = "/signup",
	logInHref = "/api/auth/signin",
	bookDemoHref = "/demo",
	logoHref = "/",
}: NavBarProps) => {
	
    return (
        <header className="relative z-20 w-full bg-[#F8F9F3] py-4 shadow-sm hover:shadow-md hover:bg-white transition-shadow">
			<nav className="mx-auto flex max-w-full items-center justify-between px-4 py-3 md:px-6" aria-label="Primary">
				<div className="flex items-center gap-10">
					<Link
						href={logoHref}
						className="flex items-center gap-2 text-gray-900"
						aria-label="Airtable Clone Home"
					>
						{/* Minimal “cube” logo reminiscent of Airtable’s geometry */}
						<svg
						width="28"
						height="28"
						viewBox="0 0 24 24"
						role="img"
						aria-hidden="true"
						>
							<path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z" fill="#111827" />
							<path d="M3 9.75 12 14l9-4.25V18l-9 4-9-4V9.75Z" fill="#1F2937" />
						</svg>
						<span className="text-xl font-semibold tracking-tight">Airtable</span>
					</Link>

					<ul className="hidden items-center gap-5 text-[15px] font-medium text-gray-800 md:flex">
						<li>
							<Link
								href="#platform"
								className="transition hover:text-gray-950"
							>
								Platform<span className="ml-1 text-gray-400">›</span>
							</Link>
						</li>
						<li>
							<Link
								href="#solutions"
								className="transition hover:text-gray-950"
							>
								Solutions<span className="ml-1 text-gray-400">›</span>
							</Link>
						</li>
						<li>
							<Link
								href="#resources"
								className="transition hover:text-gray-950"
							>
								Resources<span className="ml-1 text-gray-400">›</span>
							</Link>
						</li>
						<li>
							<Link href="#enterprise" className="transition hover:text-gray-950">
								Enterprise
							</Link>
						</li>
						<li>
							<Link href="#pricing" className="transition hover:text-gray-950">
								Pricing
							</Link>
						</li>
					</ul>
				</div>

				{/* Right: CTAs */}
				<div className="flex items-center gap-2.5">
					<Link
						href={bookDemoHref}
						className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-400"
					>
						Book Demo
					</Link>

					<Link
						href={signUpHref}
						className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
					>
						Sign up for free
					</Link>

					{showAuthLinks && (
						<Link
						href={logInHref}
						className="hidden text-sm font-medium text-gray-900 hover:underline md:inline"
						>
						    Log in
						</Link>
					)}
				</div>
			</nav>
    	</header>
    )
}

export default NavBar