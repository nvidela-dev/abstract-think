"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTask, deleteTask, updateTask } from "@/lib/actions";

interface Task {
  id: string;
  title: string;
  sortOrder: number;
}

interface EditTasksFormProps {
  planId: string;
  tasks: Task[];
}

export function EditTasksForm({ planId, tasks: initialTasks }: EditTasksFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  function handleAddTask() {
    if (!newTaskTitle.trim()) return;

    startTransition(async () => {
      await addTask(planId, newTaskTitle.trim());
      setNewTaskTitle("");
      router.refresh();
    });
  }

  function handleStartEdit(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function handleSaveEdit() {
    if (!editingId || !editingTitle.trim()) return;

    startTransition(async () => {
      await updateTask(editingId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle("");
      router.refresh();
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  function handleDelete(taskId: string) {
    if (!confirm("Delete this task?")) return;

    startTransition(async () => {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          placeholder="Add a new task..."
          className="flex-1 h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          disabled={isPending}
        />
        <button
          onClick={handleAddTask}
          disabled={isPending || !newTaskTitle.trim()}
          className="h-12 px-4 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          >
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="flex-1 h-8 px-2 rounded border border-zinc-300 dark:border-zinc-600 bg-transparent focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="px-2 py-1 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-zinc-900 dark:text-zinc-100">
                  {task.title}
                </span>
                <button
                  onClick={() => handleStartEdit(task)}
                  disabled={isPending}
                  className="px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={isPending}
                  className="px-2 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="pt-4">
        <button
          onClick={() => router.push("/")}
          className="w-full h-12 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Done
        </button>
      </div>
    </div>
  );
}
