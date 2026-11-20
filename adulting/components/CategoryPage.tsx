import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_INFO, FREQUENCY_LABELS, type Category, type Task } from "@/lib/task-helpers";
import { addDays, dateKey, formatKey, formatTime, nextMondayKey } from "@/lib/dates";

// One page design, reused for Household, Auto, Health, and Finances
export default function CategoryPage({ category }: { category: Category }) {
  const info = CATEGORY_INFO[category];

  return (
    <div className="flex flex-col gap-6">
      {/* Title, subtitle, and "Add task" button */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{info.label}</h1>
          <p className="text-gray-600">{info.subtitle}</p>
        </div>
        <Link
          href={`/tasks/new?category=${category}`}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add {info.label} Task
        </Link>
      </div>

      <Suspense fallback={<p className="text-gray-500">Loading tasks...</p>}>
        <CategoryTasks category={category} />
      </Suspense>
    </div>
  );
}

async function CategoryTasks({ category }: { category: Category }) {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  // Only unfinished tasks in THIS category, soonest first
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, category, due_at, notes, frequency")
    .eq("status", "pending")
    .eq("category", category)
    .order("due_at");

  const timeZone = profile?.timezone ?? "America/Los_Angeles";
  const todayKey = dateKey(new Date(), timeZone);
  const nextMonday = nextMondayKey(todayKey);
  const mondayAfterThat = addDays(nextMonday, 7);

  const tasksWithDay = ((tasks ?? []) as Task[]).map((task) => ({
    ...task,
    dayKey: dateKey(new Date(task.due_at), timeZone),
  }));

  // Sort every task into exactly one column
  const columns = [
    {
      title: "Overdue",
      tasks: tasksWithDay.filter((t) => t.dayKey < todayKey),
      empty: "Nothing overdue. Great job! 🙌",
      highlight: true,
    },
    {
      title: "This Week",
      tasks: tasksWithDay.filter((t) => t.dayKey >= todayKey && t.dayKey < nextMonday),
      empty: "Nothing else this week.",
      highlight: false,
    },
    {
      title: "Next Week",
      tasks: tasksWithDay.filter((t) => t.dayKey >= nextMonday && t.dayKey < mondayAfterThat),
      empty: "Nothing scheduled yet.",
      highlight: false,
    },
    {
      title: "Later",
      tasks: tasksWithDay.filter((t) => t.dayKey >= mondayAfterThat),
      empty: "Nothing scheduled yet.",
      highlight: false,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => (
        <section key={column.title}>
          <h2 className="mb-3 text-xl font-bold">
            {column.title}{" "}
            <span className="text-base font-normal text-gray-400">({column.tasks.length})</span>
          </h2>

          <div className="flex flex-col gap-3">
            {column.tasks.length === 0 && (
              <p className="rounded-2xl bg-white/60 p-4 text-sm text-gray-500">{column.empty}</p>
            )}

            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                dayKey={task.dayKey}
                timeZone={timeZone}
                overdue={column.highlight}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// One task card, like in the Figma
function TaskCard({
  task,
  dayKey,
  timeZone,
  overdue,
}: {
  task: Task;
  dayKey: string;
  timeZone: string;
  overdue: boolean;
}) {
  return (
    <article className={`rounded-2xl p-4 shadow-sm ${overdue ? "bg-amber-100" : "bg-white"}`}>
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 h-5 w-1 shrink-0 rounded-full ${CATEGORY_INFO[task.category].color}`}
        />
        <div className="min-w-0">
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-600">
            Due: {formatKey(dayKey, { weekday: "short", month: "short", day: "numeric" })} at{" "}
            {formatTime(task.due_at, timeZone)}
          </p>
          {task.frequency && task.frequency !== "once" && (
            <p className="text-sm text-gray-600">Repeats: {FREQUENCY_LABELS[task.frequency]}</p>
          )}
          {task.notes && (
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
              <span className="font-semibold">Notes:</span> {task.notes}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}