import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    return Promise.all(
      recipes.map(async (recipe) => {
        const imageUrl = recipe.imageId
          ? await ctx.storage.getUrl(recipe.imageId)
          : null;
        return { ...recipe, imageUrl };
      }),
    );
  },
});

export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const recipe = await ctx.db.get(id);
    if (!recipe) return null;

    const imageUrl = recipe.imageId
      ? await ctx.storage.getUrl(recipe.imageId)
      : null;

    return { ...recipe, imageUrl };
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
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

export const update = mutation({
  args: {
    id: v.id("recipes"),
    title: v.string(),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, title, content, imageId, tags }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(id, { title, content, imageId, tags });
  },
});

export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(id);
  },
});
