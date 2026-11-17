import { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import FormError from "@/components/FormError";
import { login } from "@/lib/actions/auth";

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light/40";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <AuthShell
      topRight={
        <>
          <span>New User?</span>
          <Link href="/signup" className="rounded-lg bg-brand px-3 py-1 text-white hover:opacity-90">
            Get Started
          </Link>
        </>
      }
    >
      <h2 className="text-2xl font-bold text-brand">Sign In</h2>
      <p className="mt-1 text-sm text-gray-500">Let&apos;s get back on track...</p>

      <Suspense fallback={null}>
        <FormError searchParams={searchParams} />
      </Suspense>

      <form action={login} className="mt-6 flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          required
          className={inputStyle}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          className={inputStyle}
        />
        <button
          type="submit"
          className="mt-2 rounded-lg bg-brand py-2 font-semibold text-white hover:opacity-90"
        >
          Log In
        </button>
      </form>
    </AuthShell>
  );
}