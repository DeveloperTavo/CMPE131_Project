"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MiniCalendar({
  todayKey,
  taskDays,
}: {
  todayKey: string; // e.g. "2026-11-19"
  taskDays: string[]; // every day that has at least one task
}) {
  const [todayYear, todayMonth] = todayKey.split("-").map(Number);

  // Which month is the calendar showing? (Starts on the current month.)
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth - 1); // 0 = January

  function changeMonth(step: number) {
    const date = new Date(Date.UTC(year, month + step, 1));
    setYear(date.getUTCFullYear());
    setMonth(date.getUTCMonth());
  }

  // Build the grid: empty boxes before day 1, then 1, 2, 3...
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const daysWithTasks = new Set(taskDays);
  const keyFor = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
          className="rounded p-1 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="rounded p-1 hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((day) => (
          <div key={day} className="font-semibold text-gray-400">
            {day}
          </div>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <div key={`blank-${index}`} />;

          const key = keyFor(day);
          const isToday = key === todayKey;
          const hasTasks = daysWithTasks.has(key);

          return (
            <div
              key={key}
              className={`relative flex h-8 items-center justify-center rounded-lg ${
                isToday ? "bg-gray-900 font-bold text-white" : "text-gray-700"
              }`}
            >
              {day}
              {hasTasks && (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    isToday ? "bg-white" : "bg-brand-light"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}