import Link from "next/link";
import { getAllPlans, getPlanStats } from "@/lib/actions";
import { formatDate } from "@/lib/dates";

export default async function PlansHistoryPage() {
  const plans = await getAllPlans();

  // Get stats for each plan
  const plansWithStats = await Promise.all(
    plans.map(async (plan) => {
      const stats = await getPlanStats(plan.id);
      return { ...plan, stats };
    })
  );

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Plan History
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
        </header>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">No plans yet.</p>
            <Link
              href="/plans/new"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create Your First Plan
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {plansWithStats.map((plan) => (
              <li key={plan.id}>
                <Link
                  href={`/plans/${plan.id}`}
                  className={`block p-4 rounded-xl border transition-all ${
                    plan.isActive
                      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {plan.name}
                        </h2>
                        {plan.isActive && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-zinc-500 mt-1 truncate">
                          {plan.description}
                        </p>
                      )}
                      <p className="text-xs text-zinc-400 mt-2">
                        {formatDate(plan.createdAt.toISOString().split("T")[0])}
                        {plan.endedAt &&
                          ` — ${formatDate(plan.endedAt.toISOString().split("T")[0])}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {plan.stats.completionRate}%
                      </div>
                      <div className="text-xs text-zinc-500">
                        {plan.stats.totalDays} day{plan.stats.totalDays !== 1 && "s"}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
