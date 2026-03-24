import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlanById, getPlanStats, getWeeklyStats } from "@/lib/actions";
import { formatDate } from "@/lib/dates";
import { WeeklyChart } from "@/components/WeeklyChart";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getPlanById(id);

  if (!plan) {
    redirect("/plans");
  }

  const [stats, weeklyStats] = await Promise.all([
    getPlanStats(id),
    getWeeklyStats(id),
  ]);

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {plan.name}
              </h1>
              {plan.isActive && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500 text-white">
                  Active
                </span>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
            )}
          </div>
          <Link
            href="/plans"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Back
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.completionRate}%
            </div>
            <div className="text-sm text-zinc-500">Completion Rate</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.totalDays}
            </div>
            <div className="text-sm text-zinc-500">
              Day{stats.totalDays !== 1 && "s"} Active
            </div>
          </div>
        </div>

        <div className="text-sm text-zinc-500">
          Started {formatDate(plan.createdAt.toISOString().split("T")[0])}
          {plan.endedAt && (
            <> · Ended {formatDate(plan.endedAt.toISOString().split("T")[0])}</>
          )}
        </div>

        {plan.isActive && <WeeklyChart stats={weeklyStats} />}

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tasks ({plan.tasks.length})
          </h2>
          <ul className="space-y-2">
            {plan.tasks.map((task) => (
              <li
                key={task.id}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800"
              >
                {task.title}
              </li>
            ))}
          </ul>
        </div>

        {plan.isActive && (
          <div className="pt-4 flex gap-3">
            <Link
              href="/"
              className="flex-1 h-10 flex items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Go to Dashboard
            </Link>
            <Link
              href={`/plans/${plan.id}/edit`}
              className="h-10 px-4 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Edit
            </Link>
          </div>
        )}

        {!plan.isActive && (
          <Link
            href={`/plans/new?template=${plan.id}`}
            className="w-full h-12 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Use as Template
          </Link>
        )}
      </div>
    </div>
  );
}
