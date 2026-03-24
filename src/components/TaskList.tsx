"use client";

import { useTransition } from "react";
import { toggleTaskCompletion } from "@/lib/actions";

interface Task {
  id: string;
  title: string;
}

interface TaskListProps {
  tasks: Task[];
  completedTaskIds: string[];
}

export function TaskList({ tasks, completedTaskIds }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const completedSet = new Set(completedTaskIds);
  const completedCount = tasks.filter((t) => completedSet.has(t.id)).length;
  const percentage =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  function handleToggle(taskId: string) {
    startTransition(() => {
      toggleTaskCompletion(taskId);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">Today&apos;s Progress</span>
        <span className="text-2xl font-bold">{percentage}%</span>
      </div>

      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <ul className="space-y-2 mt-6">
        {tasks.map((task) => {
          const isCompleted = completedSet.has(task.id);
          return (
            <li key={task.id}>
              <button
                onClick={() => handleToggle(task.id)}
                disabled={isPending}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                    : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                } ${isPending ? "opacity-50" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-green-500 border-green-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isCompleted && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`flex-1 text-left ${
                    isCompleted
                      ? "text-zinc-500 line-through"
                      : "text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {task.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
