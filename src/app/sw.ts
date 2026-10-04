import { Serwist, CacheOnly, type PrecacheEntry } from "serwist";
import { isOnlineOnlyPath, isPublicRecipePath } from "~/lib/pwa-routes";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const entries = self.__SW_MANIFEST ?? [];
const shellEntry = entries.find(
  (entry) => typeof entry !== "string" && entry.url === "/offline",
);
const version = typeof shellEntry === "object" ? shellEntry.revision : "v1";
const shellCache = `bensrecipes-shell-${version}`;
const serwist: Serwist = new Serwist({
  precacheEntries: entries,
  cacheId: "bensrecipes",
  precacheOptions: {
    cacheName: shellCache,
    ignoreURLParametersMatching: [/^path$/, /^utm_/, /^fbclid$/],
  },
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      matcher: ({ url }) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith("/_next/static/"),
      handler: async ({ request }) => {
        for (const name of await caches.keys()) {
          if (!name.startsWith("bensrecipes-shell-")) continue;
          const response = await (await caches.open(name)).match(request);
          if (response) return response;
        }
        return fetch(request);
      },
    },
    {
      matcher: ({ url }) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith("/__offline/images/"),
      handler: new CacheOnly({ cacheName: "bensrecipes-photos-v1" }),
    },
    {
      matcher: ({ request, url }) =>
        request.mode === "navigate" &&
        url.origin === self.location.origin &&
        (isPublicRecipePath(url.pathname) || isOnlineOnlyPath(url.pathname)),
      handler: async ({ request, url }): Promise<Response> => {
        try {
          const response = await fetch(request, {
            signal: AbortSignal.timeout(6000),
          });
          if (response.status >= 500 && isPublicRecipePath(url.pathname))
            throw new Error("Public recipes temporarily unavailable");
          return response;
        } catch {
          if (isOnlineOnlyPath(url.pathname))
            return new Response(
              "<!doctype html><html lang='en'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Connection required</title><body><h1>Connection required</h1><p>Recipe management is only available online.</p><a href='/recipes'>Recipes</a></body></html>",
              {
                status: 503,
                headers: {
                  "Content-Type": "text/html; charset=utf-8",
                  "Cache-Control": "no-store",
                },
              },
            );
          const offlineUrl = new URL("/offline", self.location.origin);
          offlineUrl.searchParams.set("path", url.pathname);
          return Response.redirect(offlineUrl.href, 302);
        }
      },
    },
  ],
});

serwist.addEventListeners();
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ((await self.clients.matchAll({ type: "window" })).length > 1) return;
      const previous = (await caches.keys()).filter(
        (name) => name.startsWith("bensrecipes-shell-") && name !== shellCache,
      );
      for (const name of previous.slice(0, -1)) await caches.delete(name);
    })(),
  );
});
self.addEventListener("message", (event) => {
  const message: unknown = event.data;
  if (
    message &&
    typeof message === "object" &&
    "type" in message &&
    message.type === "SKIP_WAITING"
  )
    void self.skipWaiting();
});
