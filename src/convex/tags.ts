import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db.query("tags").withIndex("by_name").collect();
    return tags.map((t) => t.name);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Tag name cannot be empty");
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", trimmed))
      .first();
    if (existing) throw new Error("Tag already exists");
    return await ctx.db.insert("tags", { name: trimmed });
  },
});
