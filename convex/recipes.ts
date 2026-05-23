import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recipes").collect();
  },
});

export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const recipe = await ctx.db.get(id);
    if (!recipe) return null;

    const imageUrl = recipe.imageId
      ? await ctx.storage.getUrl(recipe.imageId)
      : (recipe.imageUrl ?? null);

    return { ...recipe, imageUrl };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("recipes", {
      ...args,
      authorId: identity.subject,
    });
  },
});
