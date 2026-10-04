import { openDB, type DBSchema } from "idb";
import type { FunctionReturnType } from "convex/server";
import type { api } from "~/convex/_generated/api";

type ServerRecipe = FunctionReturnType<typeof api.recipes.get>[number];
export type PublicRecipe = Omit<ServerRecipe, "authorId">;
export interface RecipeSnapshot {
  recipes: PublicRecipe[];
  tags: string[];
  syncedAt: number;
}
interface RecipeDatabase extends DBSchema {
  recipes: { key: string; value: PublicRecipe };
  metadata: { key: string; value: Omit<RecipeSnapshot, "recipes"> };
}

function database() {
  return openDB<RecipeDatabase>("bensrecipes-offline", 1, {
    upgrade(db) {
      db.createObjectStore("recipes", { keyPath: "_id" });
      db.createObjectStore("metadata");
    },
  });
}

export async function readSnapshot(): Promise<RecipeSnapshot | undefined> {
  const db = await database();
  try {
    const transaction = db.transaction(["recipes", "metadata"]);
    const [recipes, metadata] = await Promise.all([
      transaction.objectStore("recipes").getAll(),
      transaction.objectStore("metadata").get("snapshot"),
    ]);
    await transaction.done;
    return metadata
      ? {
          ...metadata,
          recipes: recipes.sort(
            (left, right) => right._creationTime - left._creationTime,
          ),
        }
      : undefined;
  } finally {
    db.close();
  }
}

export async function saveSnapshot(snapshot: RecipeSnapshot) {
  const db = await database();
  const transaction = db.transaction(["recipes", "metadata"], "readwrite");
  try {
    await transaction.objectStore("recipes").clear();
    for (const recipe of snapshot.recipes)
      await transaction.objectStore("recipes").put(recipe);
    await transaction
      .objectStore("metadata")
      .put({ tags: snapshot.tags, syncedAt: snapshot.syncedAt }, "snapshot");
    await transaction.done;
  } catch (error) {
    if (!transaction.error) transaction.abort();
    await transaction.done.catch(() => undefined);
    throw error;
  } finally {
    db.close();
  }
}

export async function clearSnapshot() {
  const db = await database();
  try {
    const transaction = db.transaction(["recipes", "metadata"], "readwrite");
    await Promise.all([
      transaction.objectStore("recipes").clear(),
      transaction.objectStore("metadata").clear(),
    ]);
    await transaction.done;
  } finally {
    db.close();
  }
}
