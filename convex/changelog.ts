import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("changelog").collect();
  },
});

export const add = mutation({
  args: {
    version: v.string(),
    date: v.string(),
    changes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("changelog", args);
  },
});

export const remove = mutation({
  args: { id: v.id("changelog") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
