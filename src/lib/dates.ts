// Timezone: UTC-3 (Argentina)
const TIMEZONE_OFFSET = -3;

export function getTodayUTC3(): string {
  const now = new Date();
  // Adjust to UTC-3
  const utc3 = new Date(now.getTime() + TIMEZONE_OFFSET * 60 * 60 * 1000);
  return utc3.toISOString().split("T")[0];
}

export function getWeekDatesUTC3(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const utc3 = new Date(now.getTime() + TIMEZONE_OFFSET * 60 * 60 * 1000);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(utc3);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}
