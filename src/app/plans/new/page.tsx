import { getAllPlans } from "@/lib/actions";
import { PlanForm } from "@/components/PlanForm";

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const allPlans = await getAllPlans();

  // Find template plan if specified
  const templatePlan = template
    ? allPlans.find((p) => p.id === template)
    : allPlans.find((p) => !p.isActive); // Use most recent inactive plan as default template

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            New Plan
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Create a new daily priorities plan
          </p>
        </header>

        <PlanForm
          templateTasks={templatePlan?.tasks.map((t) => t.title)}
          previousPlans={allPlans.filter((p) => !p.isActive)}
        />
      </div>
    </div>
  );
}
