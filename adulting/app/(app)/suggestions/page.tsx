import Link from "next/link";
import { Suspense } from "react";
import SuggestionList from "@/components/suggestions/SuggestionList";

export default function SuggestionsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Suggested Reminders</h1>
      <p className="mt-1 text-gray-600">
        Based on your About You answers. Add the ones that fit your life, and hide the rest. Added
        reminders already repeat on their own.
      </p>

      <div className="mt-6">
        <Suspense fallback={<p className="text-gray-500">Loading suggestions...</p>}>
          <SuggestionList />
        </Suspense>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          href="/dashboard"
          className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}