import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  classes: defineTable({
    name: v.string(),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    color: v.optional(v.string()),
  }),

  tasks: defineTable({
    title: v.string(),
    classId: v.optional(v.id("classes")),
    isRecurring: v.boolean(),
  }),

  taskCompletions: defineTable({
    taskId: v.id("tasks"),
    date: v.string(),
    completed: v.boolean(),
  }).index("by_task", ["taskId"]).index("by_date", ["date"]),

  reminders: defineTable({
    title: v.string(),
    message: v.optional(v.string()),
    triggerTime: v.number(),
    isActive: v.boolean(),
    isDismissed: v.boolean(),
    snoozedUntil: v.optional(v.number()),
  }),

  songs: defineTable({
    name: v.string(),
    artist: v.optional(v.string()),
    classId: v.optional(v.id("classes")),
  }),

  songStatuses: defineTable({
    songId: v.id("songs"),
    status: v.string(),
  }).index("by_song", ["songId"]),

  songProgress: defineTable({
    songId: v.id("songs"),
    date: v.string(),
    practiced: v.boolean(),
  }).index("by_song", ["songId"]).index("by_date", ["date"]),

  songSessions: defineTable({
    songId: v.id("songs"),
    date: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
  }).index("by_song", ["songId"]),

  changelog: defineTable({
    version: v.string(),
    date: v.string(),
    changes: v.array(v.string()),
  }),
});
