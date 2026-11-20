export type Category = "household" | "auto" | "health" | "finances";

// What a task looks like when we read it from the database
export type Task = {
  id: string;
  title: string;
  category: Category;
  due_at: string;
  notes: string | null;
};

// Display name and color bar for each category
export const CATEGORY_INFO: Record<Category, { label: string; color: string }> = {
  household: { label: "Household", color: "bg-sky-400" },
  auto: { label: "Auto", color: "bg-amber-400" },
  health: { label: "Health", color: "bg-rose-400" },
  finances: { label: "Finances", color: "bg-emerald-500" },
};