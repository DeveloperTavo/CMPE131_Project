"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const HOME_TYPES = ["apartment", "house", "condo", "other"];
const OWNERSHIP = ["own", "rent"];

export async function saveAboutYou(formData: FormData) {
  const isWelcome = formData.get("welcome") === "1";

  // Was this checkbox ticked?
  const isChecked = (name: string) => formData.get(name) === "on";

  // Only accept values from our list. Anything else becomes "no answer".
  const pick = (name: string, allowed: string[]) => {
    const value = String(formData.get(name) ?? "");
    return allowed.includes(value) ? value : null;
  };

  // Up to 3 vehicles, ignoring empty boxes
  const vehicles = formData
    .getAll("vehicles")
    .map((value) => String(value).trim().slice(0, 80))
    .filter((value) => value !== "")
    .slice(0, 3);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // "upsert" = update the row if it exists, otherwise insert a new one
  const { error } = await supabase.from("about_you").upsert({
    user_id: user.id,
    home_type: pick("home_type", HOME_TYPES),
    home_ownership: pick("home_ownership", OWNERSHIP),
    has_hvac: isChecked("has_hvac"),
    has_yard: isChecked("has_yard"),
    has_pets: isChecked("has_pets"),
    vehicles,
    sees_dentist: isChecked("sees_dentist"),
    wears_glasses: isChecked("wears_glasses"),
    takes_medication: isChecked("takes_medication"),
    has_kids: isChecked("has_kids"),
    pays_rent_or_mortgage: isChecked("pays_rent_or_mortgage"),
    has_car_insurance: isChecked("has_car_insurance"),
    has_credit_cards: isChecked("has_credit_cards"),
    has_subscriptions: isChecked("has_subscriptions"),
    files_taxes: isChecked("files_taxes"),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    const message = encodeURIComponent("Couldn't save your answers. Please try again.");
    redirect(`/about-you?error=${message}${isWelcome ? "&welcome=1" : ""}`);
  }

  revalidatePath("/", "layout");

  // New users continue to the dashboard. Everyone else stays here and sees "Saved!"
  redirect(isWelcome ? "/dashboard" : "/about-you?saved=1");
}