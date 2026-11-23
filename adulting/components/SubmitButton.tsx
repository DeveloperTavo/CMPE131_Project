"use client";

import { useFormStatus } from "react-dom";

// A green submit button that says "Saving..." while its form is being sent
export default function SubmitButton({
  label,
  pendingLabel = "Saving...",
}: {
  label: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}