import Link from "next/link";
import { getActivePlan, getTodayCompletions, getWeeklyStats } from "@/lib/actions";
import { TaskList } from "@/components/TaskList";
import { WeeklyChart } from "@/components/WeeklyChart";

export default async function Dashboard() {
  const plan = await getActivePlan();

  if (!plan) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            No Active Plan
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create a plan to start tracking your daily priorities.
          </p>
          <Link
            href="/plans/new"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create Your First Plan
          </Link>
        </div>
      </div>
    );
  }

  const [completedTaskIds, weeklyStats] = await Promise.all([
    getTodayCompletions(plan.tasks.map((t) => t.id)),
    getWeeklyStats(plan.id),
  ]);

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {plan.name}
            </h1>
            {plan.description && (
              <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
            )}
          </div>
          <Link
            href="/plans"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            History
          </Link>
        </header>

        <TaskList tasks={plan.tasks} completedTaskIds={completedTaskIds} />

        <WeeklyChart stats={weeklyStats} />

        <div className="pt-4 flex gap-3">
          <Link
            href={`/plans/${plan.id}/edit`}
            className="flex-1 h-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Edit Tasks
          </Link>
          <Link
            href={`/plans/${plan.id}/end`}
            className="h-10 px-4 flex items-center justify-center rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            End Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
