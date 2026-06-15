import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    authorId: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
    totalTime: v.optional(v.number()),
    cuisine: v.optional(v.string()),
  })
    .searchIndex("search_title", { searchField: "title" })
    .index("by_author", ["authorId"]),
  tags: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),
});
