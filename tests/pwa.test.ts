import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clearSnapshot,
  readSnapshot,
  saveSnapshot,
  type PublicRecipe,
} from "../src/lib/offline-db";
import { filterRecipes } from "../src/lib/recipe-filters";
import { imageCacheUrl, recipeImages } from "../src/lib/offline-images";
import { isPublicRecipePath, isOnlineOnlyPath } from "../src/lib/pwa-routes";

function recipe(overrides: Partial<PublicRecipe> = {}): PublicRecipe {
  return {
    _id: "a".repeat(32) as PublicRecipe["_id"],
    _creationTime: 1,
    title: "Quick Rice",
    content: "# Quick Rice",
    imageUrl: null,
    tags: ["Dinner"],
    difficulty: "easy",
    totalTime: 20,
    cuisine: "Italian",
    ...overrides,
  };
}

test("offline filters match title, combined tags, difficulty, time boundaries and cuisine", () => {
  const entries = [
    recipe(),
    recipe({
      _id: "b".repeat(32) as PublicRecipe["_id"],
      title: "Cake",
      tags: ["Dessert"],
      difficulty: "hard",
      totalTime: 60,
      cuisine: "British",
    }),
  ];
  assert.deepEqual(
    filterRecipes(entries, {
      searchQuery: " RICE ",
      selectedTags: ["Dinner"],
      difficulty: "easy",
      timeRange: "15to30",
      cuisine: "ITALIAN",
    }),
    [entries[0]],
  );
  assert.equal(
    filterRecipes(entries, { selectedTags: ["Dinner", "Dessert"] }).length,
    0,
  );
  assert.equal(filterRecipes(entries, { timeRange: "gt60" }).length, 0);
  assert.equal(filterRecipes(entries, { timeRange: "30to60" }).length, 1);
  assert.equal(
    filterRecipes([recipe({ totalTime: undefined })], { timeRange: "lt15" })
      .length,
    0,
  );
});

test("snapshot replacement removes deleted IDs and rolls back a failed replacement", async () => {
  await clearSnapshot();
  const first = recipe();
  const second = recipe({
    _id: "b".repeat(32) as PublicRecipe["_id"],
    _creationTime: 2,
  });
  await saveSnapshot({
    recipes: [first, second],
    tags: ["Dinner"],
    syncedAt: 10,
  });
  await saveSnapshot({
    recipes: [{ ...first, title: "Updated Rice" }],
    tags: ["Dinner"],
    syncedAt: 20,
  });
  const saved = await readSnapshot();
  assert.equal(saved?.recipes.length, 1);
  assert.equal(saved?.recipes[0]?.title, "Updated Rice");
  await assert.rejects(
    saveSnapshot({
      recipes: [{ ...first, _id: undefined } as unknown as PublicRecipe],
      tags: [],
      syncedAt: 30,
    }),
  );
  assert.deepEqual(await readSnapshot(), saved);
  await clearSnapshot();
  assert.equal(await readSnapshot(), undefined);
});

test("image keys use immutable cover identity and markdown parsing handles references", () => {
  assert.equal(
    imageCacheUrl("https://example.com/old", "storage-id"),
    imageCacheUrl("https://example.com/new", "storage-id"),
  );
  assert.notEqual(
    imageCacheUrl("https://example.com/one"),
    imageCacheUrl("https://example.com/two"),
  );
  const images = recipeImages([
    recipe({
      imageUrl: "https://example.com/cover",
      content:
        "![Inline](/logo.png)\n\n![Reference][photo]\n\n[photo]: /logo.png\n\n![Unsafe](data:image/png;base64,123)",
    }),
  ]);
  assert.equal(images.length, 2);
  assert.ok(images.some((entry) => entry.source === "/logo.png"));
});

test("only public collection and valid detail paths receive the public shell", () => {
  assert.equal(isPublicRecipePath("/recipes/" + "a".repeat(32)), true);
  for (const path of [
    "/admin",
    "/recipes/new",
    "/recipes/" + "a".repeat(32) + "/edit",
    "/sign-in",
    "/api/test",
    "/recipes/not-an-id",
  ])
    assert.equal(isPublicRecipePath(path), false);
  for (const path of [
    "/admin",
    "/admin/settings",
    "/recipes/new",
    "/recipes/" + "a".repeat(32) + "/edit",
    "/sign-in",
  ])
    assert.equal(isOnlineOnlyPath(path), true);
});
