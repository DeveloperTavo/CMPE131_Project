import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import SuggestionButtons from "@/components/suggestions/SuggestionButtons";
import { getOpenSuggestions } from "@/lib/suggestions";
import { CATEGORY_INFO, FREQUENCY_LABELS } from "@/lib/task-helpers";
import type { AboutYou } from "@/components/AboutYouForm";

// Shows suggested reminders. Pass a limit to show only the first few.
export default async function SuggestionList({ limit }: { limit?: number }) {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: about } = await supabase
    .from("about_you")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Haven't answered About You yet? Point them there.
  if (!about) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">
        Answer a few quick questions and we&apos;ll suggest reminders for you.{" "}
        <Link href="/about-you" className="font-semibold text-brand underline">
          Go to About You →
        </Link>
      </div>
    );
  }

  // Titles of tasks they already have, so we don't suggest duplicates
  const { data: pendingTasks } = await supabase
    .from("tasks")
    .select("title")
    .eq("status", "pending");

  const aboutRow = about as AboutYou & { hidden_suggestions: string[] };
  const openSuggestions = getOpenSuggestions(
    aboutRow,
    aboutRow.hidden_suggestions ?? [],
    (pendingTasks ?? []).map((task) => String(task.title))
  );
  const shown = limit !== undefined ? openSuggestions.slice(0, limit) : openSuggestions;

  if (openSuggestions.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">
        You&apos;re all caught up! 🎉 No new suggestions right now.{" "}
        <Link href="/about-you" className="font-semibold text-brand underline">
          Update your answers
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {shown.map((suggestion) => (
          <li
            key={suggestion.id}
            className="flex items-start justify-between gap-3 rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="flex min-w-0 gap-3">
              <span
                className={`mt-1 h-5 w-1 shrink-0 rounded-full ${CATEGORY_INFO[suggestion.category].color}`}
              />
              <div className="min-w-0">
                <p className="font-semibold">{suggestion.title}</p>
                <p className="text-xs text-gray-500">
                  {FREQUENCY_LABELS[suggestion.frequency]} · {suggestion.why}
                </p>
              </div>
            </div>
            <SuggestionButtons suggestionId={suggestion.id} title={suggestion.title} />
          </li>
        ))}
      </ul>

      {limit !== undefined && openSuggestions.length > limit && (
        <Link href="/suggestions" className="text-sm font-semibold text-brand hover:underline">
          See all {openSuggestions.length} suggestions →
        </Link>
      )}
    </div>
  );
}