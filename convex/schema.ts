import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    authorId: v.optional(v.string()),
  })
    .searchIndex("search_title", { searchField: "title" })
    .index("by_author", ["authorId"]),
});
