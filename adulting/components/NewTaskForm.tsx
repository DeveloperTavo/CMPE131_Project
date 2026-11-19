"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { createTask } from "@/lib/actions/tasks";

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light/40";

export default function NewTaskForm() {
  // Runs in the browser right before the form is sent to the server.
  // The browser knows the user's time zone, so it turns "Nov 20 at 8:45 AM"
  // into one exact moment in time that the server can't get wrong.
  async function handleSubmit(formData: FormData) {
    const date = String(formData.get("dueDate") ?? "");
    const time = String(formData.get("dueTime") || "09:00");
    const dueAt = new Date(`${date}T${time}`);

    formData.set("dueAt", Number.isNaN(dueAt.getTime()) ? "" : dueAt.toISOString());

    await createTask(formData);
  }

  return (
    <form action={handleSubmit} className="mt-6 flex flex-col gap-5">
      <Field label="Task name">
        <input
          name="title"
          required
          maxLength={120}
          placeholder="e.g. Oil change on the Camry"
          className={inputStyle}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category">
          <select name="category" defaultValue="household" className={inputStyle}>
            <option value="household">Household</option>
            <option value="auto">Auto</option>
            <option value="health">Health</option>
            <option value="finances">Finances</option>
          </select>
        </Field>

        <Field label="Repeats">
          <select name="frequency" defaultValue="once" className={inputStyle}>
            <option value="once">Does not repeat</option>
            <option value="daily">Every day</option>
            <option value="weekly">Every week</option>
            <option value="monthly">Every month</option>
            <option value="yearly">Every year</option>
          </select>
        </Field>

        <Field label="Due date">
          <input type="date" name="dueDate" required className={inputStyle} />
        </Field>

        <Field label="Due time">
          <input type="time" name="dueTime" defaultValue="09:00" required className={inputStyle} />
        </Field>
      </div>

      <Field label="Remind me">
        <select name="remindBefore" defaultValue="1440" className={inputStyle}>
          <option value="0">At the due time</option>
          <option value="60">1 hour before</option>
          <option value="1440">1 day before</option>
          <option value="10080">1 week before</option>
          <option value="43200">1 month before</option>
        </select>
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-gray-700">Notify me by</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="notifyEmail" defaultChecked className="h-4 w-4 accent-brand" />
          Email
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="notifySms" className="h-4 w-4 accent-brand" />
          Text message (SMS)
          <span className="text-gray-400">(we&apos;ll ask for your phone number later)</span>
        </label>
      </fieldset>

      <Field label="Notes (optional)">
        <textarea
          name="notes"
          rows={3}
          maxLength={1000}
          placeholder="e.g. Buy 5W-30 oil and the right filter"
          className={inputStyle}
        />
      </Field>

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}

// A label with an input underneath it
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
      {label}
      {children}
    </label>
  );
}

// The Save button shows "Saving..." while the form is being sent
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Task"}
    </button>
  );
}