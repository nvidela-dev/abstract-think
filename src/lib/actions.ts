"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { plans, planTasks, taskCompletions } from "@/db/schema";
import { getTodayUTC3, getWeekDatesUTC3 } from "./dates";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// ============ PLANS ============

export async function getActivePlan() {
  const userId = await getUserId();

  const plan = await db.query.plans.findFirst({
    where: and(eq(plans.userId, userId), eq(plans.isActive, true)),
    with: {
      tasks: {
        orderBy: (tasks, { asc }) => [asc(tasks.sortOrder)],
      },
    },
  });

  return plan;
}

export async function getPlanById(planId: string) {
  const userId = await getUserId();

  const plan = await db.query.plans.findFirst({
    where: and(eq(plans.id, planId), eq(plans.userId, userId)),
    with: {
      tasks: {
        orderBy: (tasks, { asc }) => [asc(tasks.sortOrder)],
      },
    },
  });

  return plan;
}

export async function getAllPlans() {
  const userId = await getUserId();

  return db.query.plans.findMany({
    where: eq(plans.userId, userId),
    orderBy: [desc(plans.createdAt)],
    with: {
      tasks: true,
    },
  });
}

export async function createPlan(data: {
  name: string;
  description?: string;
  tasks: string[];
}) {
  const userId = await getUserId();

  // Deactivate any existing active plan
  await db
    .update(plans)
    .set({ isActive: false, endedAt: new Date() })
    .where(and(eq(plans.userId, userId), eq(plans.isActive, true)));

  // Create new plan
  const [plan] = await db
    .insert(plans)
    .values({
      userId,
      name: data.name,
      description: data.description || null,
      isActive: true,
    })
    .returning();

  // Create tasks
  if (data.tasks.length > 0) {
    await db.insert(planTasks).values(
      data.tasks.map((title, index) => ({
        planId: plan.id,
        title,
        sortOrder: index,
      }))
    );
  }

  revalidatePath("/");
  revalidatePath("/plans");

  return plan;
}

export async function updatePlan(
  planId: string,
  data: { name?: string; description?: string }
) {
  const userId = await getUserId();

  await db
    .update(plans)
    .set(data)
    .where(and(eq(plans.id, planId), eq(plans.userId, userId)));

  revalidatePath("/");
  revalidatePath("/plans");
  revalidatePath(`/plans/${planId}`);
}

export async function endPlan(planId: string) {
  const userId = await getUserId();

  await db
    .update(plans)
    .set({ isActive: false, endedAt: new Date() })
    .where(and(eq(plans.id, planId), eq(plans.userId, userId)));

  revalidatePath("/");
  revalidatePath("/plans");
}

// ============ TASKS ============

export async function addTask(planId: string, title: string) {
  const userId = await getUserId();

  // Verify plan ownership
  const plan = await db.query.plans.findFirst({
    where: and(eq(plans.id, planId), eq(plans.userId, userId)),
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  // Get max sort order
  const maxOrder = await db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), -1)` })
    .from(planTasks)
    .where(eq(planTasks.planId, planId));

  await db.insert(planTasks).values({
    planId,
    title,
    sortOrder: (maxOrder[0]?.max ?? -1) + 1,
  });

  revalidatePath("/");
  revalidatePath(`/plans/${planId}`);
}

export async function updateTask(taskId: string, title: string) {
  await db.update(planTasks).set({ title }).where(eq(planTasks.id, taskId));

  revalidatePath("/");
}

export async function deleteTask(taskId: string) {
  await db.delete(planTasks).where(eq(planTasks.id, taskId));

  revalidatePath("/");
}

export async function reorderTasks(taskIds: string[]) {
  await Promise.all(
    taskIds.map((id, index) =>
      db.update(planTasks).set({ sortOrder: index }).where(eq(planTasks.id, id))
    )
  );

  revalidatePath("/");
}

// ============ COMPLETIONS ============

export async function toggleTaskCompletion(taskId: string) {
  const today = getTodayUTC3();

  // Check if already completed today
  const existing = await db.query.taskCompletions.findFirst({
    where: and(
      eq(taskCompletions.planTaskId, taskId),
      eq(taskCompletions.date, today)
    ),
  });

  if (existing) {
    // Remove completion
    await db.delete(taskCompletions).where(eq(taskCompletions.id, existing.id));
  } else {
    // Add completion
    await db.insert(taskCompletions).values({
      planTaskId: taskId,
      date: today,
    });
  }

  revalidatePath("/");
}

export async function getTodayCompletions(taskIds: string[]) {
  if (taskIds.length === 0) return [];

  const today = getTodayUTC3();

  const completions = await db.query.taskCompletions.findMany({
    where: and(
      inArray(taskCompletions.planTaskId, taskIds),
      eq(taskCompletions.date, today)
    ),
  });

  return completions.map((c) => c.planTaskId);
}

export async function getWeeklyStats(planId: string) {
  const weekDates = getWeekDatesUTC3();
  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];

  // Get all tasks for this plan
  const tasks = await db.query.planTasks.findMany({
    where: eq(planTasks.planId, planId),
  });

  if (tasks.length === 0) {
    return weekDates.map((date) => ({ date, percentage: 0 }));
  }

  const taskIds = tasks.map((t) => t.id);

  // Get completions for the week
  const completions = await db.query.taskCompletions.findMany({
    where: and(
      inArray(taskCompletions.planTaskId, taskIds),
      gte(taskCompletions.date, startDate),
      lte(taskCompletions.date, endDate)
    ),
  });

  // Group by date
  const completionsByDate = new Map<string, number>();
  for (const completion of completions) {
    const count = completionsByDate.get(completion.date) || 0;
    completionsByDate.set(completion.date, count + 1);
  }

  return weekDates.map((date) => ({
    date,
    percentage: Math.round(
      ((completionsByDate.get(date) || 0) / tasks.length) * 100
    ),
  }));
}

export async function getPlanStats(planId: string) {
  // Get plan with tasks
  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, planId),
    with: { tasks: true },
  });

  if (!plan || plan.tasks.length === 0) {
    return { totalDays: 0, completionRate: 0 };
  }

  const taskIds = plan.tasks.map((t) => t.id);

  // Get all completions for this plan
  const completions = await db.query.taskCompletions.findMany({
    where: inArray(taskCompletions.planTaskId, taskIds),
  });

  // Calculate days active
  const startDate = new Date(plan.createdAt);
  const endDate = plan.endedAt ? new Date(plan.endedAt) : new Date();
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Total possible completions = tasks * days
  const totalPossible = plan.tasks.length * Math.max(totalDays, 1);
  const completionRate = Math.round((completions.length / totalPossible) * 100);

  return { totalDays: Math.max(totalDays, 1), completionRate };
}
