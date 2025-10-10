"use client";
import React from 'react';
import NavBar from "./Navbar";
import Hero from './Hero';

export default function HomeClient() {
    return (
        <main className=" bg-bg w-full">
            <NavBar />
            <Hero />
        </main>
    );
}
