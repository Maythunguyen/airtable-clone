"use client";

import Link from "next/link";
import { type Session } from "next-auth";
import SignOutButton from "./SignOutButton";

export default function HomeClient({ session }: { session: Session | null }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
            <div className="max-w-2xl text-center space-y-6">
                <h1 className="text-5xl font-bold">Airtable Clone</h1>

                <p className="text-lg text-gray-600">
                    Build and explore your data in an interactive, spreadsheet-style interface.
                </p>

                <div className="flex justify-center">
                    <Link
                        href={session ? "/dashboard" : "/api/auth/signin"}
                        className="rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
                    >
                        {session ? "Go to Dashboard" : "Sign in with Google"}
                    </Link>
                </div>

                {session && (
                <div className="flex flex-col items-center space-y-1">
                    <p className="text-sm text-gray-500">
                        Logged in as {session.user?.name}
                    </p>
                    <SignOutButton />
                </div>
                )}
            </div>
        </main>
    );
}
