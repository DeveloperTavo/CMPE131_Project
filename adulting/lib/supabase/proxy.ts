import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages anyone can visit without logging in
const AUTH_PAGES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Save refreshed login cookies on the request AND the response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Ask Supabase who is logged in (this also refreshes their login if needed).
  // Important: don't put any code between createServerClient and this line.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = AUTH_PAGES.some((page) => path.startsWith(page));
  const isHomePage = path === "/";

  // Sends the visitor to another page, keeping any refreshed login cookies
  function redirectTo(pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  // Rule 1: Not logged in, and trying to see a private page? Go to login.
  if (!user && !isAuthPage && !isHomePage) {
    return redirectTo("/login");
  }

  // Rule 2: Already logged in, and on login, signup, or home? Go to dashboard.
  if (user && (isAuthPage || isHomePage)) {
    return redirectTo("/dashboard");
  }

  // Otherwise, let them through
  return response;
}