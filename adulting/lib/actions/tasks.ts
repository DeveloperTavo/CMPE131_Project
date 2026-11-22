"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// The only values we allow. These match the rules in our database.
const CATEGORIES = ["household", "auto", "health", "finances"];
const FREQUENCIES = ["once", "daily", "weekly", "monthly", "yearly"];
const REMIND_OPTIONS = [0, 60, 1440, 10080, 43200]; // minutes: due time, 1 hour, 1 day, 1 week, ~1 month

function goBackWithError(message: string): never {
  redirect(`/tasks/new?error=${encodeURIComponent(message)}`);
}

export async function createTask(formData: FormData) {
  // 1. Read what the user typed
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const frequency = String(formData.get("frequency") ?? "once");
  const notes = String(formData.get("notes") ?? "").trim();
  const dueAtText = String(formData.get("dueAt") ?? "");
  const remindBefore = Number(formData.get("remindBefore") ?? 0);
  const notifyEmail = formData.get("notifyEmail") === "on";
  const notifySms = formData.get("notifySms") === "on";

  // 2. Double-check everything (never trust the browser alone)
  if (!title) goBackWithError("Please give your task a name.");
  if (title.length > 120) goBackWithError("Task name is too long (120 characters max).");
  if (notes.length > 1000) goBackWithError("Notes are too long (1000 characters max).");
  if (!CATEGORIES.includes(category)) goBackWithError("Please pick a category.");
  if (!FREQUENCIES.includes(frequency)) goBackWithError("Please pick how often it repeats.");
  if (!REMIND_OPTIONS.includes(remindBefore)) goBackWithError("Please pick when to be reminded.");

  const dueAt = new Date(dueAtText);
  if (!dueAtText || Number.isNaN(dueAt.getTime())) {
    goBackWithError("Please pick a valid due date and time.");
  }

  // 3. Save it. owner_id is filled in automatically with the logged-in user.
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title,
    category,
    frequency,
    notes: notes || null,
    due_at: dueAt.toISOString(),
    remind_before_minutes: remindBefore,
    notify_email: notifyEmail,
    notify_sms: notifySms,
  });

  if (error) {
    goBackWithError("Something went wrong saving your task. Please try again.");
  }

  // 4. Back to the dashboard
  redirect("/dashboard");
}

// Marks a task done (and schedules the next one if it repeats).
// Returns an error message, or null if it worked.
export async function completeTask(taskId: string): Promise<{ error: string | null }> {
  if (!taskId) return { error: "Missing task." };

  const supabase = await createClient();

  // Calls the complete_task database function
  const { error } = await supabase.rpc("complete_task", { task_id: taskId });

  if (error) {
    console.error("Could not complete task:", error.message);
    return { error: "Couldn't complete this task. Please try again." };
  }

  // Refresh every page so the finished task disappears everywhere
  revalidatePath("/", "layout");
  return { error: null };
}