"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import React from "react";

export default function SignInPage() {
    return (
        <div className="flex flex-row min-h-screen items-center justify-between px-16 max-w-7xl mx-auto">
        <div className="rounded-xl bg-white p-10 w-full max-w-lg">
            <div className="mb-8">
                <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN920PRg1lct-eTOLsbWKpALOQ5A-uKx8RpA&s"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="mb-4"
                />
                <h1 className="text-3xl font-semibold mb-2">Sign in to Airtable</h1>
                <p className="text-gray-500 text-sm">
                    Enter your email or use your SSO account.
                </p>
            </div>

            <div className="w-full">
                <form className="space-y-4">
                    <label className="block text-sm font-medium text-gray-800">
                    Email
                    </label>
                    <input
                    type="email"
                    placeholder="Email address"
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[15px] outline-none ring-0 focus:border-gray-400"
                    autoFocus
                    />

                    <button
                    type="submit"
                    className="w-full rounded-md bg-indigo-400 py-3 text-center text-white text-[15px] font-medium hover:bg-indigo-500 transition"
                    >
                    Continue
                    </button>
                </form>

            <div className="my-6 flex items-center text-center justify-center gap-3">
                <p className="text-gray-500 text-sm text-center">or</p>
            </div>

            <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="flex items-center justify-center w-full gap-2 rounded-md border border-gray-300 py-3 text-[15px] hover:bg-gray-50 transition"
            >
                <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={22}
                height={22}
                />
                <span className="text-gray-700 font-medium">
                Continue with Google
                </span>
            </button>
            </div>
        </div>

        <div className="hidden md:block">
            <Image
            src="/omi.webp"
            alt="Omni"
            width={420}
            height={420}
            className="object-cover rounded-xl hover:scale-105 transition-transform duration-300"
            />
        </div>
        </div>
    );
}
