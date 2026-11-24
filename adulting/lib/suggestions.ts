import type { AboutYou } from "@/components/AboutYouForm";
import type { Category } from "@/lib/task-helpers";
import { addDays } from "@/lib/dates";

export type Suggestion = {
  id: string; // a unique name, e.g. "hvac-filter"
  title: string;
  category: Category;
  frequency: string; // one of the keys in FREQUENCY_LABELS
  remindBefore: number; // minutes, like the New Task form
  firstDueInDays: number; // the first task is due this many days from today
  fixedMonthDay?: string; // OR always due on this date each year, e.g. "04-15"
  notes: string;
  why: string; // shown to the user: why are we suggesting this?
};

// Every suggestion that matches the user's About You answers
export function buildSuggestions(about: AboutYou): Suggestion[] {
  const list: Suggestion[] = [];

  // Adds a suggestion only if "applies" is true
  const suggest = (suggestion: Suggestion, applies: boolean) => {
    if (applies) list.push(suggestion);
  };

  const hasHome = about.home_type !== null;

  // ---------- HOME ----------
  suggest(
    {
      id: "hvac-filter",
      title: "Replace HVAC filter",
      category: "household",
      frequency: "quarterly",
      remindBefore: 1440,
      firstDueInDays: 7,
      notes: "Check the filter size before buying a new one.",
      why: "You have heating / air conditioning",
    },
    about.has_hvac
  );
  suggest(
    {
      id: "smoke-detectors",
      title: "Test smoke detectors and batteries",
      category: "household",
      frequency: "semiannually",
      remindBefore: 1440,
      firstDueInDays: 14,
      notes: "Press the test button on each detector. Replace batteries if they chirp.",
      why: "Every home needs working smoke detectors",
    },
    hasHome
  );
  suggest(
    {
      id: "deep-clean",
      title: "Deep clean the house",
      category: "household",
      frequency: "quarterly",
      remindBefore: 10080,
      firstDueInDays: 21,
      notes: "Fridge, oven, baseboards, and under the furniture.",
      why: "A seasonal reset for your home",
    },
    hasHome
  );
  suggest(
    {
      id: "gutters",
      title: "Clean the gutters",
      category: "household",
      frequency: "semiannually",
      remindBefore: 10080,
      firstDueInDays: 30,
      notes: "Best done in spring and fall.",
      why: "You own a house",
    },
    about.home_type === "house" && about.home_ownership === "own"
  );
  suggest(
    {
      id: "yard-care",
      title: "Yard care",
      category: "household",
      frequency: "weekly",
      remindBefore: 1440,
      firstDueInDays: 3,
      notes: "Mow, water, and pull weeds.",
      why: "You have a yard or garden",
    },
    about.has_yard
  );
  suggest(
    {
      id: "pet-vet",
      title: "Pet checkup at the vet",
      category: "household",
      frequency: "yearly",
      remindBefore: 10080,
      firstDueInDays: 30,
      notes: "Ask about vaccines that are due.",
      why: "You have pets",
    },
    about.has_pets
  );
  suggest(
    {
      id: "pet-meds",
      title: "Pet flea and tick medicine",
      category: "household",
      frequency: "monthly",
      remindBefore: 1440,
      firstDueInDays: 7,
      notes: "",
      why: "You have pets",
    },
    about.has_pets
  );

  // ---------- VEHICLES (one set for each vehicle) ----------
  for (const vehicle of about.vehicles) {
    suggest(
      {
        id: `oil-change:${vehicle}`,
        title: `Oil change – ${vehicle}`,
        category: "auto",
        frequency: "quarterly",
        remindBefore: 10080,
        firstDueInDays: 14,
        notes: "Check your owner's manual for the right oil type.",
        why: `You drive a ${vehicle}`,
      },
      true
    );
    suggest(
      {
        id: `tire-rotation:${vehicle}`,
        title: `Tire rotation – ${vehicle}`,
        category: "auto",
        frequency: "semiannually",
        remindBefore: 10080,
        firstDueInDays: 30,
        notes: "Many shops do this for free with an oil change.",
        why: `You drive a ${vehicle}`,
      },
      true
    );
    suggest(
      {
        id: `registration:${vehicle}`,
        title: `Registration renewal – ${vehicle}`,
        category: "auto",
        frequency: "yearly",
        remindBefore: 43200,
        firstDueInDays: 30,
        notes: "Check your DMV notice for the exact due date and update this task.",
        why: `You drive a ${vehicle}`,
      },
      true
    );
  }

  // ---------- HEALTH ----------
  suggest(
    {
      id: "physical",
      title: "Annual physical",
      category: "health",
      frequency: "yearly",
      remindBefore: 43200,
      firstDueInDays: 30,
      notes: "Call your doctor's office to schedule.",
      why: "A yearly checkup is recommended for everyone",
    },
    true
  );
  suggest(
    {
      id: "dentist",
      title: "Dental cleaning",
      category: "health",
      frequency: "semiannually",
      remindBefore: 10080,
      firstDueInDays: 30,
      notes: "",
      why: "You go to the dentist",
    },
    about.sees_dentist
  );
  suggest(
    {
      id: "eye-exam",
      title: "Eye exam",
      category: "health",
      frequency: "yearly",
      remindBefore: 10080,
      firstDueInDays: 30,
      notes: "Bring your current glasses or contacts.",
      why: "You wear glasses or contacts",
    },
    about.wears_glasses
  );
  suggest(
    {
      id: "refill",
      title: "Refill prescriptions",
      category: "health",
      frequency: "monthly",
      remindBefore: 10080,
      firstDueInDays: 21,
      notes: "",
      why: "You take regular medication",
    },
    about.takes_medication
  );
  suggest(
    {
      id: "kids-checkups",
      title: "Kids' checkups",
      category: "health",
      frequency: "yearly",
      remindBefore: 43200,
      firstDueInDays: 30,
      notes: "Ask about vaccines that are due.",
      why: "You have kids or dependents",
    },
    about.has_kids
  );

  // ---------- FINANCES ----------
  suggest(
    {
      id: "rent",
      title: "Pay rent / mortgage",
      category: "finances",
      frequency: "monthly",
      remindBefore: 10080,
      firstDueInDays: 7,
      notes: "Update the due date to match your lease or loan.",
      why: "You pay rent or a mortgage",
    },
    about.pays_rent_or_mortgage
  );
  suggest(
    {
      id: "car-insurance",
      title: "Renew car insurance",
      category: "finances",
      frequency: "semiannually",
      remindBefore: 43200,
      firstDueInDays: 30,
      notes: "Compare quotes before renewing. You might save money.",
      why: "You have car insurance",
    },
    about.has_car_insurance
  );
  suggest(
    {
      id: "credit-card",
      title: "Pay credit card bill",
      category: "finances",
      frequency: "monthly",
      remindBefore: 10080,
      firstDueInDays: 7,
      notes: "Paying the full balance avoids interest.",
      why: "You have credit cards",
    },
    about.has_credit_cards
  );
  suggest(
    {
      id: "subscriptions",
      title: "Review subscriptions",
      category: "finances",
      frequency: "quarterly",
      remindBefore: 1440,
      firstDueInDays: 14,
      notes: "Cancel anything you don't use anymore.",
      why: "You have subscriptions",
    },
    about.has_subscriptions
  );
  suggest(
    {
      id: "taxes",
      title: "File taxes",
      category: "finances",
      frequency: "yearly",
      remindBefore: 43200,
      firstDueInDays: 0,
      fixedMonthDay: "04-15",
      notes: "The federal deadline is usually April 15.",
      why: "You file your own taxes",
    },
    about.files_taxes
  );

  return list;
}

// Only the suggestions the user hasn't added, hidden, or already created themselves
export function getOpenSuggestions(
  about: AboutYou,
  hiddenIds: string[],
  existingTaskTitles: string[]
): Suggestion[] {
  const existing = new Set(existingTaskTitles.map((title) => title.trim().toLowerCase()));

  return buildSuggestions(about).filter(
    (suggestion) =>
      !hiddenIds.includes(suggestion.id) && !existing.has(suggestion.title.toLowerCase())
  );
}

// Which day the first task should be due, e.g. "2026-12-07"
export function firstDueKey(suggestion: Suggestion, todayKey: string): string {
  if (suggestion.fixedMonthDay) {
    const year = Number(todayKey.slice(0, 4));
    const thisYear = `${year}-${suggestion.fixedMonthDay}`;
    return thisYear > todayKey ? thisYear : `${year + 1}-${suggestion.fixedMonthDay}`;
  }
  return addDays(todayKey, suggestion.firstDueInDays);
}