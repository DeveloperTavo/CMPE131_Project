import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-cream p-10 text-gray-900">
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <Welcome />
      </Suspense>

      <form action={logout} className="mt-6">
        <button className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:opacity-90">
          Log Out
        </button>
      </form>
    </main>
  );
}

// The part of the page that needs to know who's logged in
async function Welcome() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <h1 className="text-3xl font-bold text-brand">
        Welcome, {profile?.full_name ?? user.email}!
      </h1>
      <p className="mt-2 text-gray-600">
        You&apos;re logged in. The real dashboard is coming soon.
      </p>
    </>
  );
}