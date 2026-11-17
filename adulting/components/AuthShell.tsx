import type { ReactNode } from "react";

const categories = [
  { icon: "🏠", label: "Home" },
  { icon: "🚗", label: "Auto" },
  { icon: "🩺", label: "Health" },
  { icon: "💰", label: "Finances" },
];

export default function AuthShell({
  children,
  topRight,
}: {
  children: ReactNode;
  topRight: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream text-gray-900">
      {/* Decorative green circles in the corners */}
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-light/30" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-brand-light/40" />

      {/* Top right corner: "New User? Get Started" or "Have an account? Sign In" */}
      <div className="absolute right-6 top-6 flex items-center gap-3 text-sm font-semibold">
        {topRight}
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-6 py-20 md:flex-row">
        {/* Left side: logo and tagline */}
        <section className="flex-1 text-center">
          <h1 className="text-6xl font-extrabold tracking-tight text-brand">
            Adulting<span className="text-sunny">✦</span>
          </h1>
          <div className="mx-auto mt-1 h-1.5 w-48 rounded-full bg-brand-light" />
          <p className="mt-8 text-2xl font-bold text-brand">Adulthood, handled.</p>
          <p className="mt-2 font-medium">Home, Auto, Health, Finances, all in one place!</p>

          <ul className="mt-8 flex justify-center gap-6">
            {categories.map((c) => (
              <li key={c.label} className="flex flex-col items-center gap-1 text-sm text-brand">
                <span className="text-3xl" aria-hidden>
                  {c.icon}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        </section>

        {/* Thin divider line */}
        <div className="hidden h-96 w-px bg-gray-400 md:block" />

        {/* Right side: the white card that holds the form */}
        <section className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
          {children}
        </section>
      </div>
    </main>
  );
}