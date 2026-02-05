import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getAllCompletions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("taskCompletions").collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    classId: v.optional(v.id("classes")),
    isRecurring: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    // Delete completions first
    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task", (q) => q.eq("taskId", args.id))
      .collect();
    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const toggleCompletion = mutation({
  args: {
    taskId: v.id("tasks"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { completed: !existing.completed });
    } else {
      await ctx.db.insert("taskCompletions", {
        taskId: args.taskId,
        date: args.date,
        completed: true,
      });
    }
  },
});
