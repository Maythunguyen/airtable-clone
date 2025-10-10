import { auth } from "~/server/auth";
import HomeClient from "./_components/HomeClient";

export default async function Home() {
	const session = await auth();

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
			<HomeClient session={session} />	
		</main>
	);
};
