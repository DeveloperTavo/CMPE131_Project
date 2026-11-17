import { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import FormError from "@/components/FormError";
import { signup } from "@/lib/actions/auth";

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light/40";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <AuthShell
      topRight={
        <>
          <span>Have an account?</span>
          <Link href="/login" className="rounded-lg bg-brand px-3 py-1 text-white hover:opacity-90">
            Sign In
          </Link>
        </>
      }
    >
      <h2 className="text-2xl font-bold text-brand">Create Account</h2>
      <p className="mt-1 text-sm text-gray-500">Let&apos;s get you organized.</p>

      <Suspense fallback={null}>
        <FormError searchParams={searchParams} />
      </Suspense>

      <form action={signup} className="mt-6 flex flex-col gap-4">
        <input
          name="fullName"
          type="text"
          placeholder="Full Name"
          autoComplete="name"
          required
          className={inputStyle}
        />
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
          placeholder="Password (at least 8 characters)"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputStyle}
        />
        <button
          type="submit"
          className="mt-2 rounded-lg bg-brand py-2 font-semibold text-white hover:opacity-90"
        >
          Sign Up
        </button>
      </form>
    </AuthShell>
  );
}