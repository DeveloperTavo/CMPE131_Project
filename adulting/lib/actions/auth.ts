"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Sends the user back to a page with an error message in the URL
function goBackWithError(page: string, message: string): never {
  redirect(`${page}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    goBackWithError("/login", "Please enter your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    goBackWithError("/login", "Wrong email or password. Please try again.");
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    goBackWithError("/signup", "Please fill in every field.");
  }
  if (password.length < 8) {
    goBackWithError("/signup", "Password must be at least 8 characters.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // This is what our database trigger reads to fill in the profile name
    options: { data: { full_name: fullName } },
  });

  if (error) {
    goBackWithError("/signup", error.message);
  }

  redirect("/about-you?welcome=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}