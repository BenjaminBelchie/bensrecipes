"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isPublicRecipePath } from "~/lib/pwa-routes";
import {
  readSnapshot,
  clearSnapshot,
  type RecipeSnapshot,
} from "~/lib/offline-db";
import { PHOTO_CACHE } from "~/lib/offline-images";
import { RecipeContent } from "~/components/RecipeContent";
import RecipesPage from "~/app/(site)/recipes/page";
import { RecipeDataContext } from "~/components/RecipeDataProvider";
import { PwaTools } from "~/components/PwaTools";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "~/components/ui/empty";

export function OfflineApp() {
  const [snapshot, setSnapshot] = useState<RecipeSnapshot>();
  const [loaded, setLoaded] = useState(false);
  const [pathname, setPathname] = useState("/recipes");
  useEffect(() => {
    const readPath = () =>
      setPathname(
        new URLSearchParams(window.location.search).get("path") ??
          window.location.pathname,
      );
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || !isPublicRecipePath(url.pathname))
        return;
      event.preventDefault();
      event.stopPropagation();
      const offlineUrl = new URL("/offline", location.origin);
      offlineUrl.searchParams.set("path", url.pathname);
      window.history.pushState(null, "", offlineUrl.href);
      setPathname(url.pathname);
      window.scrollTo(0, 0);
    };
    readPath();
    document.addEventListener("click", navigate, true);
    window.addEventListener("popstate", readPath);
    const reconnect = () => {
      const path =
        new URLSearchParams(location.search).get("path") ?? "/recipes";
      window.location.replace(isPublicRecipePath(path) ? path : "/recipes");
    };
    window.addEventListener("online", reconnect);
    void readSnapshot()
      .then(setSnapshot)
      .catch(() => undefined)
      .finally(() => setLoaded(true));
    return () => {
      document.removeEventListener("click", navigate, true);
      window.removeEventListener("popstate", readPath);
      window.removeEventListener("online", reconnect);
    };
  }, []);
  if (!loaded)
    return (
      <p className="p-6" role="status">
        Loading saved recipes...
      </p>
    );
  if (!snapshot)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No saved recipes</EmptyTitle>
          <EmptyDescription>
            Connect to download the recipe collection.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  const id = /^\/recipes\/([a-z0-9]{32})$/.exec(pathname)?.[1];
  const recipe = snapshot.recipes.find((entry) => entry._id === id);
  if (id && !recipe)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Recipe unavailable offline</EmptyTitle>
          <EmptyDescription>
            <Link
              href="/recipes"
              prefetch={false}
              onClick={(event) => {
                event.preventDefault();
                window.location.assign("/recipes");
              }}
            >
              Back to recipes
            </Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  return (
    <RecipeDataContext.Provider
      value={{
        snapshot,
        loaded,
        offline: true,
        savedAt: snapshot.syncedAt,
        clear: async () => {
          await clearSnapshot();
          await caches.delete(PHOTO_CACHE);
          setSnapshot(undefined);
        },
        retry: () =>
          window.location.replace(
            isPublicRecipePath(pathname) ? pathname : "/recipes",
          ),
      }}
    >
      <PwaTools />
      {recipe ? <RecipeContent recipe={recipe} offline /> : <RecipesPage />}
    </RecipeDataContext.Provider>
  );
}
