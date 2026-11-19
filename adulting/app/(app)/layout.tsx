import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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

      {/* Floating "New Task" button in the bottom-right corner */}
      <Link
        href="/tasks/new"
        aria-label="New task"
        title="New task"
        className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-white shadow-lg transition hover:scale-105 hover:bg-brand"
      >
        <Plus className="h-9 w-9" strokeWidth={3} />
      </Link>
    </div>
  );
}