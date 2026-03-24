"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { endPlan } from "@/lib/actions";

interface EndPlanFormProps {
  planId: string;
}

export function EndPlanForm({ planId }: EndPlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleEnd() {
    startTransition(async () => {
      await endPlan(planId);
      router.push("/plans/new");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleEnd}
        disabled={isPending}
        className="w-full h-12 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? "Ending..." : "End Plan"}
      </button>
      <button
        onClick={() => router.back()}
        disabled={isPending}
        className="w-full h-12 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
    </div>
  );
}
