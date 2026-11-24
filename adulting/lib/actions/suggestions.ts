"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildSuggestions, firstDueKey } from "@/lib/suggestions";
import { dateKey, zonedTimeToUtc } from "@/lib/dates";
import type { AboutYou } from "@/components/AboutYouForm";

type AboutRow = AboutYou & { hidden_suggestions: string[] };

// Turns a suggestion into a real task
export async function addSuggestion(suggestionId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please log in again." };

  const { data: about } = await supabase
    .from("about_you")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!about) return { error: "Please fill out About You first." };
  const aboutRow = about as AboutRow;

  // Look the suggestion up on the server. The browser only sends its id,
  // so nobody can sneak in a different title or category.
  const suggestion = buildSuggestions(aboutRow).find((s) => s.id === suggestionId);
  if (!suggestion) return { error: "That suggestion isn't available anymore." };

  // Due at 9:00 AM in the user's own time zone
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const timeZone = profile?.timezone ?? "America/Los_Angeles";
  const todayKey = dateKey(new Date(), timeZone);
  const dueAt = zonedTimeToUtc(firstDueKey(suggestion, todayKey), "09:00", timeZone);

  const { error } = await supabase.from("tasks").insert({
    title: suggestion.title,
    category: suggestion.category,
    frequency: suggestion.frequency,
    notes: suggestion.notes || null,
    due_at: dueAt.toISOString(),
    remind_before_minutes: suggestion.remindBefore,
    notify_email: true,
    notify_sms: false,
  });

  if (error) return { error: "Couldn't add this reminder. Please try again." };

  // Don't suggest it again
  await supabase
    .from("about_you")
    .update({ hidden_suggestions: [...aboutRow.hidden_suggestions, suggestionId] })
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
  return { error: null };
}

// "Not for me": hides a suggestion for good
export async function hideSuggestion(suggestionId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please log in again." };

  const { data: about } = await supabase
    .from("about_you")
    .select("hidden_suggestions")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!about) return { error: "Please fill out About You first." };

  const hidden: string[] = about.hidden_suggestions ?? [];
  if (!hidden.includes(suggestionId)) {
    await supabase
      .from("about_you")
      .update({ hidden_suggestions: [...hidden, suggestionId] })
      .eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
  return { error: null };
}