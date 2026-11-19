"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, House, Car, HeartPulse, Wallet, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/household", label: "Household", icon: House },
  { href: "/auto", label: "Auto", icon: Car },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/finances", label: "Finances", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  // Which page are we on right now? (Used to highlight the matching link.)
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-6 rounded-2xl bg-black/5 p-4 md:flex">
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-full px-4 py-2 font-semibold transition ${
                isActive ? "bg-brand-light/60 text-brand" : "text-gray-800 hover:bg-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Placeholder for the Calvin assistant */}
      <div className="mt-auto rounded-xl bg-white p-3 text-sm text-gray-400 shadow-sm">
        Calvin here, how can I help?
        <p className="mt-2 text-xs">(Coming soon)</p>
      </div>
    </aside>
  );
}