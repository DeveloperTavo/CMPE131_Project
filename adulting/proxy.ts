import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Runs before every page load
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Which pages the guard checks: everything except images and Next.js's internal files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};