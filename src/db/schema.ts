import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Users table (synced from Clerk)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Plans - a set of daily priorities
export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

// Plan tasks - individual tasks within a plan
export const planTasks = pgTable("plan_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Task completions - records of completed tasks per day
export const taskCompletions = pgTable(
  "task_completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planTaskId: uuid("plan_task_id")
      .notNull()
      .references(() => planTasks.id, { onDelete: "cascade" }),
    date: date("date").notNull(), // Date only, no time
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    // Prevent completing same task twice on same day
    uniqueIndex("task_date_unique").on(table.planTaskId, table.date),
  ]
);

// Relations
export const plansRelations = relations(plans, ({ many }) => ({
  tasks: many(planTasks),
}));

export const planTasksRelations = relations(planTasks, ({ one, many }) => ({
  plan: one(plans, {
    fields: [planTasks.planId],
    references: [plans.id],
  }),
  completions: many(taskCompletions),
}));

export const taskCompletionsRelations = relations(
  taskCompletions,
  ({ one }) => ({
    task: one(planTasks, {
      fields: [taskCompletions.planTaskId],
      references: [planTasks.id],
    }),
  })
);
