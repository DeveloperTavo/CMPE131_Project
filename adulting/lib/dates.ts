// We describe days with "day keys" like "2026-11-19".
// They're easy to compare: "2026-11-18" < "2026-11-19" is true, just like in a dictionary.

// Which calendar day is it for this moment, in this time zone?
export function dateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Turns a day key into a Date (at noon UTC, which avoids edge-of-day surprises)
function keyToDate(key: string): Date {
  return new Date(`${key}T12:00:00Z`);
}

// "2026-11-19" + 3 days = "2026-11-22"
export function addDays(key: string, days: number): string {
  const date = keyToDate(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// 0 = Sunday, 1 = Monday, ... 6 = Saturday
export function weekdayIndex(key: string): number {
  return keyToDate(key).getUTCDay();
}

// Formats a day key, e.g. formatKey("2026-11-19", { weekday: "long" }) gives "Thursday"
export function formatKey(key: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(keyToDate(key));
}

// "2026-11-20T16:45:00Z" shown in California time gives "8:45 AM"
export function formatTime(isoDate: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

// "Good morning", "Good afternoon" or "Good evening" based on the user's local hour
export function greetingFor(date: Date, timeZone: string): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(date)
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// The Monday after today. This is where "next week" starts.
export function nextMondayKey(todayKey: string): string {
  const today = weekdayIndex(todayKey); // 0 = Sunday ... 6 = Saturday
  return addDays(todayKey, today === 0 ? 1 : 8 - today);
}