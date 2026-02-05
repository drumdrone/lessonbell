import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActiveReminders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reminders")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getDueReminders = query({
  args: { currentTime: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("isDismissed"), false),
          q.lte(q.field("triggerTime"), args.currentTime)
        )
      )
      .collect();
  },
});

export const addReminder = mutation({
  args: {
    title: v.string(),
    message: v.optional(v.string()),
    triggerTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reminders", {
      ...args,
      isActive: true,
      isDismissed: false,
    });
  },
});

export const updateReminder = mutation({
  args: {
    id: v.id("reminders"),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    triggerTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteReminder = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const dismissReminder = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isDismissed: true });
  },
});

export const snoozeReminder = mutation({
  args: {
    id: v.id("reminders"),
    snoozeUntil: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      snoozedUntil: args.snoozeUntil,
      triggerTime: args.snoozeUntil,
    });
  },
});
