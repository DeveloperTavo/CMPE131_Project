import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Bell, Inbox, Search, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

const topLinks = [
  { href: "/files", label: "Files" },
  { href: "/shared", label: "Shared" },
  { href: "/invite", label: "Invite" },
];

export default function TopBar() {
  return (
    <header className="flex items-center gap-8 px-6 py-4">
      {/* Logo */}
      <Link href="/dashboard" className="text-3xl font-extrabold tracking-tight text-brand">
        Adulting<span className="text-sunny">✦</span>
      </Link>

      {/* Files / Shared / Invite */}
      <nav className="hidden gap-8 font-semibold md:flex">
        {topLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-brand">
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Search box (we'll make it work in a later commit) */}
      <div className="relative ml-auto w-full max-w-md">
        <input
          type="search"
          placeholder="Search a task"
          className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm outline-none focus:border-brand"
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>

      {/* Bell and inbox icons */}
      <button aria-label="Notifications" className="text-gray-700 hover:text-brand">
        <Bell className="h-6 w-6" />
      </button>
      <button aria-label="Inbox" className="text-gray-700 hover:text-brand">
        <Inbox className="h-6 w-6" />
      </button>

      {/* Avatar + log out (needs to know who's logged in) */}
      <Suspense fallback={<div className="h-10 w-10 rounded-full bg-brand-light/40" />}>
        <UserMenu />
      </Suspense>
    </header>
  );
}

async function UserMenu() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name ?? user.email ?? "?";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/about-you"
        title={`${name} – About You`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light/50 font-bold text-brand hover:ring-2 hover:ring-brand-light"
      >
        {initial}
      </Link>
      <form action={logout}>
        <button aria-label="Log out" title="Log out" className="text-gray-600 hover:text-brand">
          <LogOut className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}