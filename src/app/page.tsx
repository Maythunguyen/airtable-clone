// import { auth } from "~/server/auth";
import HomeClient from "./_components/HomeClient";


export default async function Home() {

	return (
		<main className="flex flex-col min-h-screen bg-bg">
			<HomeClient  />	
		</main>
	);
};
