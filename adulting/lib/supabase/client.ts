import { createBrowserClient } from "@supabase/ssr";

// Use this inside components that run in the browser ("use client" files).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}