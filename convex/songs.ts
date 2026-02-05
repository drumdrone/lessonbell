import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songs").collect();
  },
});

export const getAllStatuses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songStatuses").collect();
  },
});

export const getAllProgress = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songProgress").collect();
  },
});

export const getAllSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songSessions").collect();
  },
});

export const addSong = mutation({
  args: {
    name: v.string(),
    artist: v.optional(v.string()),
    classId: v.optional(v.id("classes")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("songs", args);
  },
});

export const deleteSong = mutation({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    // Delete related data
    const statuses = await ctx.db
      .query("songStatuses")
      .withIndex("by_song", (q) => q.eq("songId", args.id))
      .collect();
    for (const status of statuses) {
      await ctx.db.delete(status._id);
    }

    const progress = await ctx.db
      .query("songProgress")
      .withIndex("by_song", (q) => q.eq("songId", args.id))
      .collect();
    for (const p of progress) {
      await ctx.db.delete(p._id);
    }

    const sessions = await ctx.db
      .query("songSessions")
      .withIndex("by_song", (q) => q.eq("songId", args.id))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    songId: v.id("songs"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("songStatuses")
      .withIndex("by_song", (q) => q.eq("songId", args.songId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status });
    } else {
      await ctx.db.insert("songStatuses", {
        songId: args.songId,
        status: args.status,
      });
    }
  },
});

export const toggleProgress = mutation({
  args: {
    songId: v.id("songs"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("songProgress")
      .withIndex("by_song", (q) => q.eq("songId", args.songId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { practiced: !existing.practiced });
    } else {
      await ctx.db.insert("songProgress", {
        songId: args.songId,
        date: args.date,
        practiced: true,
      });
    }
  },
});

export const addSession = mutation({
  args: {
    songId: v.id("songs"),
    date: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("songSessions", args);
  },
});

export const deleteSession = mutation({
  args: { id: v.id("songSessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
