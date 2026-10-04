"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "~/convex/_generated/api";
import {
  readSnapshot,
  saveSnapshot,
  clearSnapshot,
  type RecipeSnapshot,
} from "~/lib/offline-db";
import {
  downloadRecipeImages,
  PHOTO_CACHE,
  type PhotoProgress,
} from "~/lib/offline-images";
import { useOnline } from "~/hooks/use-online";

export interface RecipeData {
  snapshot?: RecipeSnapshot;
  loaded: boolean;
  offline: boolean;
  error?: string;
  savedAt?: number;
  progress?: PhotoProgress;
  syncing?: boolean;
  retry?: () => void;
  clear?: () => Promise<void>;
}

export const RecipeDataContext = createContext<RecipeData>({
  loaded: false,
  offline: false,
});

export function useRecipes() {
  return useContext(RecipeDataContext);
}

export function OnlineRecipeProvider({ children }: { children: ReactNode }) {
  const recipes = useQuery(api.recipes.get);
  const tags = useQuery(api.tags.list);
  const online = useOnline();
  const [snapshot, setSnapshot] = useState<RecipeSnapshot>();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>();
  const [savedAt, setSavedAt] = useState<number>();
  const [progress, setProgress] = useState<PhotoProgress>();
  const [syncing, setSyncing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    void readSnapshot()
      .then((saved) => {
        if (active) {
          setSnapshot((current) => current ?? saved);
          setSavedAt((current) => current ?? saved?.syncedAt);
        }
      })
      .catch(() => {
        if (active) setError("Local storage is unavailable.");
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!recipes || !tags || !online || paused) {
      setSyncing(false);
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setSyncing(true);
    const synchronize = async () => {
      let currentRecipes = recipes;
      let currentTags = tags;
      if (retryCount > 0) {
        const client = new ConvexHttpClient(
          process.env.NEXT_PUBLIC_CONVEX_URL!,
        );
        [currentRecipes, currentTags] = await Promise.all([
          client.query(api.recipes.get),
          client.query(api.tags.list),
        ]);
      }
      if (controller.signal.aborted) return;
      const next: RecipeSnapshot = {
        recipes: currentRecipes.map((recipe) => ({
          _id: recipe._id,
          _creationTime: recipe._creationTime,
          title: recipe.title,
          content: recipe.content,
          imageId: recipe.imageId,
          imageUrl: recipe.imageUrl,
          tags: recipe.tags,
          difficulty: recipe.difficulty,
          totalTime: recipe.totalTime,
          cuisine: recipe.cuisine,
        })),
        tags: currentTags,
        syncedAt: Date.now(),
      };
      setSnapshot(next);
      setLoaded(true);
      writes.current = writes.current
        .then(async () => {
          if (controller.signal.aborted) return;
          await saveSnapshot(next);
          if (controller.signal.aborted) return;
          setSavedAt(next.syncedAt);
          setError(undefined);
          void navigator.storage?.persist?.().catch(() => false);
          try {
            await downloadRecipeImages(
              next.recipes,
              (value) => {
                if (!controller.signal.aborted) setProgress(value);
              },
              controller.signal,
            );
          } catch {
            if (!controller.signal.aborted)
              setError("Photos could not be saved on this device.");
          }
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setError("Recipes could not be saved on this device.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setSyncing(false);
        });
      await writes.current;
    };
    void synchronize().catch(() => {
      if (!controller.signal.aborted) {
        setError(
          "Connection to recipes is unavailable. Saved recipes are unchanged.",
        );
        setSyncing(false);
      }
    });
    return () => controller.abort();
  }, [recipes, tags, online, retryCount, paused]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        setRetryCount((count) => count + 1);
    };
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const clear = async () => {
    setPaused(true);
    controllerRef.current?.abort();
    await writes.current;
    await clearSnapshot();
    if ("caches" in window) await caches.delete(PHOTO_CACHE);
    setSavedAt(undefined);
    setProgress(undefined);
    setSyncing(false);
  };
  return (
    <RecipeDataContext.Provider
      value={{
        snapshot,
        loaded,
        offline: !online,
        error,
        savedAt,
        progress,
        syncing,
        retry: () => {
          setPaused(false);
          setRetryCount((count) => count + 1);
        },
        clear,
      }}
    >
      {children}
    </RecipeDataContext.Provider>
  );
}
