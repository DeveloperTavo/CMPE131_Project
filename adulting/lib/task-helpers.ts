export type Category = "household" | "auto" | "health" | "finances";

export const CATEGORIES: Category[] = ["household", "auto", "health", "finances"];

// What a task looks like when we read it from the database
export type Task = {
  id: string;
  title: string;
  category: Category;
  due_at: string;
  notes: string | null;
  frequency?: string;
};

// Display name, color bar, and subtitle for each category
export const CATEGORY_INFO: Record<
  Category,
  { label: string; color: string; subtitle: string }
> = {
  household: {
    label: "Household",
    color: "bg-sky-400",
    subtitle: "Shared responsibilities for everyone at home",
  },
  auto: {
    label: "Auto",
    color: "bg-amber-400",
    subtitle: "Shared responsibilities for the family cars",
  },
  health: {
    label: "Health",
    color: "bg-rose-400",
    subtitle: "An apple a day keeps the doctor away",
  },
  finances: {
    label: "Finances",
    color: "bg-emerald-500",
    subtitle: "Bills, payments, and money matters",
  },
};

// Friendly names for how often a task repeats
export const FREQUENCY_LABELS: Record<string, string> = {
  once: "Does not repeat",
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
  yearly: "Every year",
};