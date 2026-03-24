import { redirect } from "next/navigation";
import { getPlanById } from "@/lib/actions";
import { EditTasksForm } from "@/components/EditTasksForm";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getPlanById(id);

  if (!plan) {
    redirect("/");
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Edit Tasks
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{plan.name}</p>
        </header>

        <EditTasksForm planId={plan.id} tasks={plan.tasks} />
      </div>
    </div>
  );
}
