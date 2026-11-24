"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addSuggestion, hideSuggestion } from "@/lib/actions/suggestions";

// The "Add" and "Not for me" buttons for one suggestion
export default function SuggestionButtons({
  suggestionId,
  title,
}: {
  suggestionId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await addSuggestion(suggestionId);
      if (result.error) setError(result.error);
    });
  }

  function handleHide() {
    setError(null);
    startTransition(async () => {
      const result = await hideSuggestion(suggestionId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {isPending ? "..." : "Add"}
        </button>
        <button
          type="button"
          onClick={handleHide}
          disabled={isPending}
          aria-label={`Hide "${title}"`}
          title="Not for me"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="max-w-40 text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}