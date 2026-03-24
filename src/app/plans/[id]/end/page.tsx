import { redirect } from "next/navigation";
import { getPlanById } from "@/lib/actions";
import { EndPlanForm } from "@/components/EndPlanForm";

export default async function EndPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getPlanById(id);

  if (!plan || !plan.isActive) {
    redirect("/");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          End Plan?
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          This will archive <strong>{plan.name}</strong> and you&apos;ll be able
          to create a new plan. Your history and stats will be preserved.
        </p>

        <EndPlanForm planId={plan.id} />
      </div>
    </div>
  );
}
