import { getDayOfWeek } from "@/lib/dates";

interface DayStats {
  date: string;
  percentage: number;
}

interface WeeklyChartProps {
  stats: DayStats[];
}

export function WeeklyChart({ stats }: WeeklyChartProps) {
  const maxHeight = 120; // pixels

  return (
    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-500 mb-4">Last 7 Days</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {stats.map((day) => {
          const height = (day.percentage / 100) * maxHeight;
          const isToday = day.date === stats[stats.length - 1].date;

          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {day.percentage}%
              </span>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  isToday
                    ? "bg-green-500"
                    : day.percentage > 0
                      ? "bg-zinc-300 dark:bg-zinc-700"
                      : "bg-zinc-200 dark:bg-zinc-800"
                }`}
                style={{
                  height: Math.max(height, 4),
                }}
              />
              <span
                className={`text-xs ${
                  isToday
                    ? "font-semibold text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500"
                }`}
              >
                {getDayOfWeek(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
