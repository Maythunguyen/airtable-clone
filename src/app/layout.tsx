import "~/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Airtable Clone",
	description: "Fast spreadsheet-like DB with Next.js + tRPC + Postgres",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};


const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

export default function RootLayout({
  	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={inter.variable}>
			<body className="font-sans">
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
