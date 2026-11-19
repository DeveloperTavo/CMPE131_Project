import type { ReactNode } from "react";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";

// Every page inside the (app) folder gets wrapped in this frame
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-gray-900">
      <TopBar />
      <div className="flex gap-6 px-6 pb-6">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}