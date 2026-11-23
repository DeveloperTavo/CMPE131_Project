import Link from "next/link";
import type { ReactNode } from "react";
import { saveAboutYou } from "@/lib/actions/about-you";
import SubmitButton from "@/components/SubmitButton";
import { CATEGORY_INFO } from "@/lib/task-helpers";

// What a saved row from the about_you table looks like
export type AboutYou = {
  home_type: string | null;
  home_ownership: string | null;
  has_hvac: boolean;
  has_yard: boolean;
  has_pets: boolean;
  vehicles: string[];
  sees_dentist: boolean;
  wears_glasses: boolean;
  takes_medication: boolean;
  has_kids: boolean;
  pays_rent_or_mortgage: boolean;
  has_car_insurance: boolean;
  has_credit_cards: boolean;
  has_subscriptions: boolean;
  files_taxes: boolean;
};

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light/40";

export default function AboutYouForm({
  about,
  isWelcome,
}: {
  about: AboutYou | null; // null if they've never saved before
  isWelcome: boolean;
}) {
  const vehicles = about?.vehicles ?? [];

  return (
    <form action={saveAboutYou} className="mt-6 flex flex-col gap-6">
      <input type="hidden" name="welcome" value={isWelcome ? "1" : "0"} />

      {/* ---------- HOME ---------- */}
      <Section title="Home" color={CATEGORY_INFO.household.color}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
            What kind of home do you live in?
            <select name="home_type" defaultValue={about?.home_type ?? ""} className={inputStyle}>
              <option value="">Choose one</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo / Townhouse</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
            Do you own or rent?
            <select
              name="home_ownership"
              defaultValue={about?.home_ownership ?? ""}
              className={inputStyle}
            >
              <option value="">Choose one</option>
              <option value="own">Own</option>
              <option value="rent">Rent</option>
            </select>
          </label>
        </div>

        <p className="mt-4 text-sm font-semibold text-gray-700">My home has...</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Checkbox name="has_hvac" label="Heating / air conditioning (HVAC)" checked={about?.has_hvac} />
          <Checkbox name="has_yard" label="A yard or garden" checked={about?.has_yard} />
          <Checkbox name="has_pets" label="Pets" checked={about?.has_pets} />
        </div>
      </Section>

      {/* ---------- VEHICLES ---------- */}
      <Section title="Vehicles" color={CATEGORY_INFO.auto.color}>
        <p className="text-sm text-gray-600">
          List up to 3 vehicles, like &ldquo;2018 Toyota Camry&rdquo;. Leave blank if you don&apos;t
          have one.
        </p>
        <div className="mt-3 grid gap-3">
          {[0, 1, 2].map((index) => (
            <input
              key={index}
              name="vehicles"
              defaultValue={vehicles[index] ?? ""}
              maxLength={80}
              placeholder={`Vehicle ${index + 1}`}
              className={inputStyle}
            />
          ))}
        </div>
      </Section>

      {/* ---------- HEALTH ---------- */}
      <Section title="Health" color={CATEGORY_INFO.health.color}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Checkbox name="sees_dentist" label="I go to the dentist" checked={about?.sees_dentist} />
          <Checkbox name="wears_glasses" label="I wear glasses or contacts" checked={about?.wears_glasses} />
          <Checkbox name="takes_medication" label="I take regular medication" checked={about?.takes_medication} />
          <Checkbox name="has_kids" label="I have kids or dependents" checked={about?.has_kids} />
        </div>
      </Section>

      {/* ---------- FINANCES ---------- */}
      <Section title="Finances" color={CATEGORY_INFO.finances.color}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Checkbox name="pays_rent_or_mortgage" label="I pay rent or a mortgage" checked={about?.pays_rent_or_mortgage} />
          <Checkbox name="has_car_insurance" label="I have car insurance" checked={about?.has_car_insurance} />
          <Checkbox name="has_credit_cards" label="I have credit cards" checked={about?.has_credit_cards} />
          <Checkbox name="has_subscriptions" label="I have subscriptions (streaming, gym...)" checked={about?.has_subscriptions} />
          <Checkbox name="files_taxes" label="I file my own taxes" checked={about?.files_taxes} />
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        {isWelcome && (
          <Link
            href="/dashboard"
            className="rounded-lg px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100"
          >
            Skip for now
          </Link>
        )}
        <SubmitButton label={isWelcome ? "Save and Continue" : "Save"} />
      </div>
    </form>
  );
}

// A white card with a colored bar and a title
function Section({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <span className={`h-5 w-1 rounded-full ${color}`} />
        {title}
      </h2>
      {children}
    </section>
  );
}

// One checkbox with its label
function Checkbox({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked ?? false} className="h-4 w-4 accent-brand" />
      {label}
    </label>
  );
}