"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPlan } from "@/lib/actions";

interface PreviousPlan {
  id: string;
  name: string;
  tasks: { title: string }[];
}

interface PlanFormProps {
  templateTasks?: string[];
  previousPlans?: PreviousPlan[];
}

export function PlanForm({ templateTasks = [], previousPlans = [] }: PlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<string[]>(
    templateTasks.length > 0 ? templateTasks : [""]
  );

  function handleAddTask() {
    setTasks([...tasks, ""]);
  }

  function handleRemoveTask(index: number) {
    setTasks(tasks.filter((_, i) => i !== index));
  }

  function handleTaskChange(index: number, value: string) {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  }

  function handleLoadTemplate(plan: PreviousPlan) {
    setTasks(plan.tasks.map((t) => t.title));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validTasks = tasks.filter((t) => t.trim() !== "");
    if (!name.trim() || validTasks.length === 0) return;

    startTransition(async () => {
      await createPlan({
        name: name.trim(),
        description: description.trim() || undefined,
        tasks: validTasks,
      });
      router.push("/");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {previousPlans.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Load from previous plan
          </label>
          <div className="flex flex-wrap gap-2">
            {previousPlans.slice(0, 5).map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleLoadTemplate(plan)}
                className="px-3 py-1.5 text-sm rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                {plan.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Plan Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Q1 Focus"
          className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you focusing on?"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Daily Tasks
        </label>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
                className="flex-1 h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTask(index)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:border-red-900 text-zinc-400 hover:text-red-500"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddTask}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Task
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending || !name.trim() || tasks.every((t) => !t.trim())}
        className="w-full h-12 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating..." : "Create Plan"}
      </button>
    </form>
  );
}
