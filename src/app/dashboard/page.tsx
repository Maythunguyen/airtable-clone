
"use client";

import HeadBar from "../_components/HeadBar";
import { SidebarDemo  } from "../_components/SideBar";

export default function DashboardPage() {

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F7F4]">
      <HeadBar />
      <SidebarDemo />
      
    </div>
  );
}
