import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AboutYouForm, { type AboutYou } from "@/components/AboutYouForm";

type Params = Promise<{ welcome?: string; saved?: string; error?: string }>;

export default function AboutYouPage({ searchParams }: { searchParams: Params }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <AboutYouContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AboutYouContent({ searchParams }: { searchParams: Params }) {
  await connection();
  const { welcome, saved, error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Their saved answers, if any. maybeSingle() = "zero or one row is fine"
  const { data: about } = await supabase
    .from("about_you")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const isWelcome = welcome === "1";

  return (
    <>
      <h1 className="text-3xl font-bold">
        {isWelcome ? "Welcome to Adulting! 👋" : "About You"}
      </h1>
      <p className="mt-1 text-gray-600">
        Tell us a little about your life so we can suggest the right reminders. Every question is
        optional, and your answers are only visible to you.
      </p>

      {saved && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Saved! Your answers are up to date.{" "}
          <Link href="/suggestions" className="font-semibold underline">
            See your suggested reminders →
          </Link>
        </p>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <AboutYouForm about={about as AboutYou | null} isWelcome={isWelcome} />
    </>
  );
}