import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import { CATEGORY_INFO, type Task } from "@/lib/task-helpers";
import {
  addDays,
  dateKey,
  formatKey,
  formatTime,
  greetingFor,
  weekdayIndex,
} from "@/lib/dates";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-8 text-gray-500">Loading your tasks...</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await connection();
  const supabase = await createClient();

  // 1. Who's logged in?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Get their name and time zone
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, timezone")
    .eq("id", user.id)
    .single();

  // 3. Get all their unfinished tasks, soonest first
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, category, due_at, notes")
    .eq("status", "pending")
    .order("due_at");

  const timeZone = profile?.timezone ?? "America/Los_Angeles";
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";
  const now = new Date();
  const todayKey = dateKey(now, timeZone);

  // 4. Label each task with the day it's due, e.g. "2026-11-20"
  const tasksWithDay = ((tasks ?? []) as Task[]).map((task) => ({
    ...task,
    dayKey: dateKey(new Date(task.due_at), timeZone),
  }));

  // 5. Sort tasks into today, overdue, and next week
  const todaysTasks = tasksWithDay.filter((task) => task.dayKey === todayKey);
  const overdueTasks = tasksWithDay.filter((task) => task.dayKey < todayKey);

  const today = weekdayIndex(todayKey); // 0 = Sunday ... 6 = Saturday
  const daysUntilNextMonday = today === 0 ? 1 : 8 - today;
  const nextMonday = addDays(todayKey, daysUntilNextMonday);
  const nextWeek = Array.from({ length: 7 }, (_, i) => addDays(nextMonday, i));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* ---------- LEFT COLUMN ---------- */}
      <div className="flex flex-col gap-6">
        {/* Today */}
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold">
            {greetingFor(now, timeZone)}, {firstName}!
          </h1>
          <p className="text-gray-600">Here are your tasks for the day</p>

          <div className="mt-6 flex flex-col gap-8 sm:flex-row">
            <p className="text-4xl font-bold leading-tight">
              {formatKey(todayKey, { weekday: "long" })}
              <br />
              {formatKey(todayKey, { month: "long" })}
              <br />
              {formatKey(todayKey, { day: "numeric" })}, {formatKey(todayKey, { year: "numeric" })}
            </p>

            <ul className="flex flex-1 flex-col justify-center gap-3">
              {todaysTasks.length === 0 && (
                <li className="text-gray-500">Nothing due today. Enjoy! 🎉</li>
              )}
              {todaysTasks.map((task) => (
                <TaskLine key={task.id} task={task} time={formatTime(task.due_at, timeZone)} />
              ))}
            </ul>
          </div>
        </section>

        {/* Next Week */}
        <section>
          <h2 className="mb-3 text-xl font-bold">Next Week</h2>
          <div className="rounded-2xl bg-white px-6 py-2 shadow-sm">
            {nextWeek.map((dayKey) => {
              const dayTasks = tasksWithDay.filter((task) => task.dayKey === dayKey);

              return (
                <div key={dayKey} className="border-b border-gray-200 py-3 last:border-none">
                  <p className="font-semibold">
                    <span className="underline underline-offset-4">
                      {formatKey(dayKey, { weekday: "long" })}
                    </span>{" "}
                    <span className="text-sm font-normal text-gray-400">
                      {formatKey(dayKey, { month: "numeric", day: "numeric" })}
                    </span>
                  </p>

                  {dayTasks.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-2 pl-2">
                      {dayTasks.map((task) => (
                        <TaskLine
                          key={task.id}
                          task={task}
                          time={formatTime(task.due_at, timeZone)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ---------- RIGHT COLUMN ---------- */}
      <div className="flex flex-col gap-6">
        <MiniCalendar todayKey={todayKey} taskDays={tasksWithDay.map((task) => task.dayKey)} />

        <section>
          <h2 className="mb-3 text-xl font-bold">Overdue</h2>
          <div className="min-h-40 rounded-2xl bg-amber-100 p-5">
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-gray-600">Nothing overdue. Great job! 🙌</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {overdueTasks.map((task) => (
                  <li key={task.id} className="flex gap-4 text-sm">
                    <span className="font-semibold text-gray-600">
                      {formatKey(task.dayKey, { month: "numeric", day: "2-digit" })}
                    </span>
                    <span className="font-semibold">{task.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// One task: colored category bar, title, and time
function TaskLine({ task, time }: { task: Task; time: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`h-6 w-1 shrink-0 rounded-full ${CATEGORY_INFO[task.category].color}`} />
      <span className="font-semibold">{task.title}</span>
      <span className="text-sm text-gray-500">{time}</span>
    </li>
  );
}