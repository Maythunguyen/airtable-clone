"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut()}
            className="mt-2 text-sm text-gray-500 underline hover:text-gray-700"
        >
            Sign out
        </button>
    );
}
