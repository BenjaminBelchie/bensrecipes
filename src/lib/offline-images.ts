import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { PublicRecipe } from "~/lib/offline-db";

export const PHOTO_CACHE = "bensrecipes-photos-v1";
const PHOTO_BUDGET = 100 * 1024 * 1024;
export interface PhotoProgress {
  completed: number;
  total: number;
  failed: number;
}
export interface OfflineImage {
  source: string;
  key: string;
}

export function imageCacheUrl(source: string, identity?: string) {
  return `/__offline/images/v1/${encodeURIComponent(identity ? `cover:${identity}` : `source:${source}`)}`;
}

export function recipeImages(recipes: PublicRecipe[]): OfflineImage[] {
  const entries = new Map<string, OfflineImage>();
  const add = (source: string, identity?: string) => {
    if (!/^https?:\/\//i.test(source) && !/^\/(?!\/)/.test(source)) return;
    const key = imageCacheUrl(source, identity);
    entries.set(key, { source, key });
  };
  for (const recipe of recipes) {
    if (recipe.imageUrl) add(recipe.imageUrl, recipe.imageId);
    const tree = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .parse(recipe.content);
    const definitions = new Map<string, string>();
    visit(tree, "definition", (node) => {
      definitions.set(node.identifier.toLowerCase(), node.url);
    });
    visit(tree, "image", (node) => {
      add(node.url);
    });
    visit(tree, "imageReference", (node) => {
      const source = definitions.get(node.identifier.toLowerCase());
      if (source) add(source);
    });
  }
  return [...entries.values()];
}

export async function downloadRecipeImages(
  recipes: PublicRecipe[],
  onProgress: (progress: PhotoProgress) => void,
  signal: AbortSignal,
) {
  const entries = recipeImages(recipes);
  const cache = await caches.open(PHOTO_CACHE);
  const wanted = new Set(
    entries.map((entry) => new URL(entry.key, location.origin).href),
  );
  for (const request of await cache.keys())
    if (!wanted.has(request.url)) await cache.delete(request);
  let bytes = 0;
  for (const request of await cache.keys()) {
    const response = await cache.match(request);
    if (response) bytes += (await response.blob()).size;
  }
  let completed = 0;
  const estimate = await navigator.storage?.estimate?.().catch(() => undefined);
  const budget = Math.min(
    PHOTO_BUDGET,
    Math.max(
      0,
      (estimate?.quota ?? Infinity) -
        (estimate?.usage ?? 0) +
        bytes -
        2 * 1024 * 1024,
    ),
  );
  let failed = 0;
  let cursor = 0;
  const report = () => onProgress({ completed, total: entries.length, failed });
  report();
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (!signal.aborted) {
        const entry = entries[cursor++];
        if (!entry) return;
        try {
          if (await cache.match(entry.key)) {
            completed++;
            report();
            continue;
          }
          const query = new URLSearchParams({
            url: entry.source,
            w: "960",
            q: "75",
          });
          let response: Response | undefined;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              response = await fetch(`/_next/image?${query}`, {
                credentials: "omit",
                signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]),
              });
              if (response.ok || response.status < 500) break;
            } catch (error) {
              if (signal.aborted || attempt === 1) throw error;
            }
            if (attempt === 0)
              await new Promise<void>((resolve) => setTimeout(resolve, 1000));
          }
          if (
            !response?.ok ||
            !response.headers.get("content-type")?.startsWith("image/")
          )
            throw new Error("Photo unavailable");
          const blob = await response.blob();
          if (bytes + blob.size > budget)
            throw new Error("Photo storage limit reached");
          bytes += blob.size;
          await cache.put(
            entry.key,
            new Response(blob, {
              headers: {
                "Content-Type": blob.type,
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            }),
          );
          completed++;
        } catch {
          if (signal.aborted) return;
          failed++;
        }
        report();
      }
    }),
  );
  return { completed, total: entries.length, failed };
}
