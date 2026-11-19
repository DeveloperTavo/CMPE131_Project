import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <Welcome />
      </Suspense>
    </div>
  );
}

// The part of the page that needs to know who's logged in
async function Welcome() {
  await connection();
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

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";

  return (
    <>
      <h1 className="text-2xl font-bold">Hello, {firstName}!</h1>
      <p className="mt-1 text-gray-600">Your tasks for the day will show up here soon.</p>
    </>
  );
}