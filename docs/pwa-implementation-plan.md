# Ben's Recipes PWA Implementation Plan

## Scope And Decisions

Turn the existing Next.js site into an installable, offline-capable public recipe app. Keep Convex as the source of truth and retain server-rendered recipe pages and SEO online.

- Open the installed app at `/recipes`.
- Use `standalone` display mode on Android and iOS: no browser toolbar, normal OS status area. This is not guaranteed immersive fullscreen.
- Use the supplied B logo for the favicon, site header, home-screen icons, and launch artwork.
- Automatically save every public recipe, including recipes never opened on the device.
- Automatically download optimized cover photos and supported markdown images.
- Support offline search, filtering, recipe reading, navigation, reloads, and cold starts.
- Keep admin, authentication, creation, editing, deletion, and uploads online-only. Do not queue writes.
- Keep the current visual design and reuse existing UI primitives.

Approved and implemented on 2026-10-04. The sections below retain the original delivery plan; the implementation status and remaining manual verification are recorded at the end.

## Completed Branding Work

| Asset                      | Location                                                                              | Purpose                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Original export            | [bensrecipes_logo.png](../bensrecipes_logo.png)                                       | Untouched source artwork, 355 x 336 pixels, with white background                   |
| Cleaned logo               | [src/app/bensrecipes_logo.png](../src/app/bensrecipes_logo.png)                       | Generated transparent artwork, 328 x 323 pixels; enclosed white lettering preserved |
| Favicon                    | [src/app/favicon.ico](../src/app/favicon.ico)                                         | ICO containing 16, 32, and 48 pixel images; discovered automatically by Next.js     |
| Site icon                  | [src/app/icon.png](../src/app/icon.png)                                               | 512 x 512 PNG; discovered automatically by Next.js                                  |
| Apple touch icon           | [src/app/apple-icon.png](../src/app/apple-icon.png)                                   | Opaque 180 x 180 PNG; discovered automatically by Next.js                           |
| Shared logo                | [public/logo.png](../public/logo.png)                                                 | Header and reusable application branding                                            |
| Small PNG icons            | [public/icons](../public/icons)                                                       | 16, 32, and 48 pixel favicon alternatives                                           |
| Standard PWA icons         | [public/icons](../public/icons)                                                       | 192 and 512 pixel images for manifest purpose `any`                                 |
| Maskable PWA icons         | [public/icons](../public/icons)                                                       | Opaque 192 and 512 pixel images with padded artwork inside the maskable safe circle |
| Apple launch images        | [public/splash](../public/splash)                                                     | 42 portrait/landscape images covering 21 display-size and pixel-ratio combinations  |
| Apple launch-image mapping | [public/splash/apple-startup-images.json](../public/splash/apple-startup-images.json) | URLs and exact device/orientation media queries                                     |
| Generator                  | [scripts/generate-app-assets.js](../scripts/generate-app-assets.js)                   | Reproducible generation and automated dimension, opacity, ICO, and maskable checks  |

Run `npm run assets:generate` after replacing the root-folder original export. The generator removes only border-connected exterior white, corrects white-matted antialiased edges, preserves the enclosed white lettering, and trims transparent margins before regenerating the cleaned logo and all variants. The source is below 512 pixels, so the largest icon is upscaled. A higher-resolution replacement would improve the largest variants without changing the workflow.

The shared header in [src/components/SiteHeader.tsx](../src/components/SiteHeader.tsx) uses the logo alongside the existing site name. The manifest and root metadata now reference the prepared install icons and Apple splash images.

## Original Architecture And Required Changes

- [src/components/RecipeGrid.tsx](../src/components/RecipeGrid.tsx) subscribes directly to Convex. Its filter logic is already local, but its data disappears on a cold offline launch.
- [src/app/(site)/recipes/page.tsx](<../src/app/(site)/recipes/page.tsx>) originally fetched tags and cuisines separately. These are now persisted or derived from the saved collection.
- [src/app/(site)/recipes/[id]/page.tsx](<../src/app/(site)/recipes/[id]/page.tsx>) retains server-fetched recipe details and metadata online; the offline shell renders shared presentation from IndexedDB instead.
- [src/convex/recipes.ts](../src/convex/recipes.ts) already returns full recipe content from the public collection query. It can supply the initial complete snapshot without fetching each recipe separately.
- The original root layout wrapped every route in Clerk and an authenticated Convex provider. Those providers now live in [src/app/(site)/layout.tsx](<../src/app/(site)/layout.tsx>); the root and offline shell are provider-free.
- [src/middleware.ts](../src/middleware.ts) protects admin routes. Service-worker fallbacks must not bypass or emulate those protections.

## Phase 1: Manifest And Installed Presentation

**Files:** new `src/app/manifest.ts`; existing root layout, global stylesheet, and generated branding assets.

1. Add a typed Next.js manifest with stable `id`, name, short name, `/recipes` start URL, `/` scope, `standalone` display, theme color, and white background color.
2. Reference separate standard and maskable icons at 192 and 512 pixels. Do not label the same padded artwork as both purposes.
3. Export Next.js viewport settings with `viewportFit: "cover"` and theme color.
4. Add Apple web-app metadata and startup-image links using the generated URL/media-query mapping. Confirm metadata output rather than duplicating Next.js file-based icon tags.
5. Add safe-area padding for the header and bottom edges using `env(safe-area-inset-*)`, without applying the same inset twice.
6. Check contrast and spacing against the existing CSS theme. Do not redesign the site.

**Acceptance:** manifest and icons return valid responses; browser developer tools recognize the manifest; the site remains usable in normal browser tabs. Full installation readiness also requires Phase 2.

## Phase 2: Offline Shell And Service Worker

**Files:** new `src/app/sw.ts`, `src/components/PwaRegistration.tsx`, and `src/app/offline/page.tsx`; update `next.config.js`, package scripts, and layout boundaries.

1. Use a maintained service-worker toolkit, preferably Serwist after confirming compatibility with the installed Next.js 15 release and production build pipeline. Do not rely on generic default caching rules.
2. Prove the smallest production slice first: load online, stop network access, close the tab, and reopen `/recipes` with a cached shell and one sample IndexedDB recipe. This must work with Clerk requests blocked too.
3. Keep the root layout provider-free. Move current online routes/providers into a `(site)` route group without changing public URLs. Give `/offline` an independent layout and public shell that does not use Clerk, Convex, or server-fetched recipe data.
4. Extract only genuinely shared public presentation, such as header and recipe content. Keep authentication controls outside the offline shell.
5. Prerender the offline shell and precache its HTML, required chunks, stylesheet, locally built fonts, and branding. Use a build-generated precache list with content revisions; never guess Next.js chunk filenames.
6. On a failed document navigation, return the shell only for `/`, `/recipes`, and valid recipe-detail URL shapes. Exclude `/recipes/new`, edit routes, admin, sign-in, sign-up, APIs, and Clerk endpoints.
7. Public navigation failures redirect to `/offline?path=<public-path>`. The shell reads that path from `window.location` and renders the appropriate saved recipe or collection. Its internal browsing uses local routing/history, not server-dependent Next.js RSC navigation. This explicit redirect avoids Next.js restoring a stale canonical URL when reusing a prerendered fallback document.
8. When navigating from the online application without connectivity, use a document navigation where needed so the service worker can provide the shell. Cover connection failures even when `navigator.onLine` reports true.
9. Do not return HTML to an RSC request. Avoid blanket caching of authenticated HTML, RSC responses, API responses, errors, or redirects. Offline detail-link transitions must explicitly fall back to a document navigation.
10. Serve the worker at root scope with an appropriate JavaScript content type and revalidation headers. Register it after page startup, not as a render-blocking dependency.
11. Disable service-worker registration during ordinary development to avoid stale development caches. Verify with a production server over localhost or deployed HTTPS.

**Acceptance:** cold-start collection and deep-link recipe rendering succeed with the network and authentication unavailable. Missing data produces a specific unavailable state, never an endless skeleton.

## Phase 3: Local Data And Synchronization

**Files:** new `src/lib/offline-db.ts`, `src/lib/recipe-sync.ts`, `src/hooks/use-recipes.ts`, and public synchronization provider; existing Convex recipes/tags queries.

1. Add `idb` for a typed, versioned IndexedDB database. Store only public recipe fields, tags, image identities, and sync metadata; exclude author identity and authentication/session data.
2. Keep recipe records indexed by Convex recipe ID. Store schema version, last successful data-sync time, and a separate photo-download status.
3. Load the last saved snapshot first. Treat database hydration and the first network response as distinct states to prevent a late local read from overwriting newer server data.
4. Subscribe to the complete public collection while online and visible. Reuse that subscription across public consumers rather than subscribing separately for every component.
5. Commit a complete, successfully received snapshot atomically. Upsert changed records and delete IDs absent from that complete snapshot. Never infer deletions from a failed or partial response.
6. Persist the tag catalogue used by current filters. Derive cuisines from saved recipes, matching the current normalization/sorting behavior.
7. Synchronize on first visit, launch, reconnection, foreground return, and relevant live updates. Do not depend on background sync APIs, which are not consistently available on iOS.
8. Resume interrupted photo downloads on subsequent launches. Record successful data synchronization even if some photos are still pending, without claiming the full collection is downloaded.
9. Distinguish backend reachability from the browser's network hint. Preserve the last known good snapshot when Convex is temporarily unavailable.
10. If collection size eventually exceeds practical single-query limits, introduce pagination with a completed-generation marker before replacing the previous snapshot. This is not required unless current data volume demands it.

**Acceptance:** first launch populates local storage; cached content loads immediately; edits, additions, and deletions synchronize correctly; interrupted synchronization cannot erase the previous snapshot.

## Phase 4: Offline Collection And Recipe Presentation

**Files:** existing collection page, recipe grid, recipe-detail page, and markdown renderer; new shared public recipe-view components consumed by the offline shell.

1. Replace direct recipe-list consumption with the shared online/local data hook. Keep current search semantics: case-insensitive recipe-title matching.
2. Use saved tags/cuisines for offline filters. Verify combined tag, difficulty, time, cuisine, and search filtering matches online behavior.
3. Extract reusable recipe-detail presentation while preserving online `generateMetadata`, canonical URLs, JSON-LD, breadcrumbs, and server-rendered content.
4. Render recipe details from IndexedDB in the offline shell. Make text available before photo downloads finish.
5. Keep in-app navigation, back/forward navigation, and reloads functional without server responses. Handle valid-but-missing IDs and deleted recipes explicitly.
6. Audit markdown image rendering and any other remote dependencies. Shared offline presentation cannot assume image optimization endpoints remain reachable.
7. For the home URL offline, provide the public recipe collection as the recovery destination. The installed app already starts there; do not cache personalized homepage HTML.
8. Reuse local `Alert`, `Badge`, `Progress`, `Button`, `Tooltip`, `Skeleton`, and `Empty` primitives for status and fallback states. No new component library is necessary.

**Acceptance:** every recipe from a completed snapshot can be opened offline, even if its detail page was never visited. Search/filter results match the same online snapshot.

## Phase 5: Photo Downloads And Storage Management

**Files:** new `src/lib/offline-images.ts`; service worker; recipe grid/detail/markdown image adapters; optional same-origin public image endpoint if required.

1. Cache one bounded-size cover rendition per recipe initially, proposed at up to 960 pixels wide. Reuse it for list and detail views offline rather than downloading every Next.js responsive variant.
2. Use a stable cache key based on storage image ID and rendition settings. For external markdown images, key by normalized source URL and transform version.
3. Verify Convex image CORS and the proposed optimization path in a production build. Prefer readable, same-origin optimized responses; avoid opaque image downloads whose sizes/status cannot be inspected.
4. If a proxy is needed, restrict it to approved public image hosts, bound image dimensions and request sizes, and prevent arbitrary URL fetching. Do not introduce an unrestricted proxy.
5. Download with limited concurrency, proposed at three requests, and retry failed items with backoff during subsequent online sessions.
6. Only mark an image complete after a successful cache write. Resolve the actual cached rendition in offline views instead of relying on unrelated `next/image` URL variants.
7. Propose an initial 100 MiB photo-cache budget, adjusted after measuring the real collection and storage quota. Preserve recipe text first when storage is constrained; show incomplete-photo status rather than evicting required photos silently.
8. Call `navigator.storage.estimate()` where available and request persistence after a successful initial sync or explicit download interaction. Treat refusal and unsupported APIs as normal cases.
9. Remove superseded/deleted recipe images after a successful snapshot and once no other recipe references them. Do not mix public image cleanup with app-shell cache cleanup.
10. Cache supported markdown images too. If a source cannot be downloaded safely, provide a fallback and identify it as unavailable offline.
11. Add manual retry/sync and clear-offline-data controls using existing primitives, with confirmation before clearing. Make these secondary controls, not a large onboarding flow.

**Acceptance:** downloaded covers appear offline in both grid and detail views; quota failures preserve text and browsing; deleted images are cleaned up; incomplete downloads are accurately reported.

## Phase 6: Online-Only Admin And Authentication

**Files:** `UserNav`, `RecipeEditor`, `ImageUpload`, `DeleteRecipeButton`, admin/new/edit pages, provider boundaries, and middleware.

1. Never precache admin pages, authenticated response bodies, Clerk endpoints, upload responses, or mutation requests.
2. Make authentication controls unavailable in the offline shell. Online sign-in and existing route protections remain unchanged.
3. Block admin actions in already-open pages when offline, including submitting an editor or an upload. Handle request failures when the browser mistakenly reports connectivity.
4. Do not persist drafts, upload tokens, admin query results, or mutation queues as part of this PWA feature.
5. For offline document navigation to an admin route, return a neutral online-required fallback, never a previously cached admin page or the public recipe-detail shell.
6. Ensure service-worker URL matching explicitly excludes new/edit routes before matching recipe IDs.

**Acceptance:** admin stays functional online; offline actions fail predictably without queued writes; no authenticated content is present in Cache Storage or the recipe database.

## Phase 7: Installation, Updates, And Recovery

**Files:** new small PWA status/update components and registration code; public layouts and global stylesheet.

1. Use the Android install event only when available. For iOS, offer compact Add to Home Screen guidance through a user-opened control; do not pretend a programmatic install prompt exists.
2. Detect standalone mode to avoid showing installation controls after installation.
3. Display concise offline state, download progress, last successful synchronization, and incomplete-image status. Avoid treating `navigator.onLine` alone as proof synchronization succeeded.
4. Introduce a waiting-worker update prompt. Activate and reload only after user acceptance, avoiding forced reloads while reading a recipe or editing online.
5. Retain assets required by existing tabs until the new worker safely takes control. Clean up old owned cache versions, not every cache on the origin.
6. Version IndexedDB schemas separately from service-worker caches. Migrate public data where possible and handle incompatible data without an infinite restart loop.
7. Document an emergency recovery procedure: unregister a broken worker, clear only owned caches, reload online, and rebuild the local snapshot.

**Acceptance:** a new deployment upgrades cleanly; declining an update preserves the active reading session; installed apps do not display duplicate installation prompts.

## Delivery Order And Dependencies

| Order | Work                                                         | Depends On                                                                      |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 1     | Manifest, viewport, and prepared branding wiring             | Completed assets                                                                |
| 2     | Provider-free offline shell and minimal cold-start proof     | Layout boundary changes and service-worker integration                          |
| 3     | Versioned database and complete collection synchronization   | Stable public data contract                                                     |
| 4     | Shared collection/detail presentation and offline navigation | Offline shell and database                                                      |
| 5     | Optimized photo downloads and storage handling               | Snapshot synchronization and offline image resolution                           |
| 6     | Admin guards and explicit cache exclusions                   | Worker policies and connectivity model; implement exclusions from the beginning |
| 7     | Install controls, progress, updates, and recovery            | Worker lifecycle and accurate synchronization state                             |
| 8     | Full regression and physical-device verification             | All phases                                                                      |

Each phase should be a small reviewable change with its own focused tests. Do not postpone the cold-start proof until after rebuilding all recipe presentation.

## Verification Matrix

| Scenario                              | Expected Result                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Install on Android                    | New B icon, launch at recipes, generated splash, no browser toolbar                            |
| Install on iPhone                     | New Apple icon, standalone launch, matching launch artwork on supported display configurations |
| First online visit                    | Complete recipe snapshot saved; covers download; progress and readiness are accurate           |
| Fresh device with no network          | Explicit unavailable state; no promise of recipes that were never downloaded                   |
| Airplane-mode cold start              | Shell, local fonts, collection, filters, and saved recipe details work                         |
| Never-viewed recipe after sync        | Text and successfully downloaded images work offline                                           |
| Direct detail URL and reload          | Correct saved recipe opens, not only a generic offline page                                    |
| Next.js link transition loses network | Falls back to document/shell navigation without HTML being supplied as RSC data                |
| Cover and markdown images             | Cached rendition renders; inaccessible sources have an honest fallback                         |
| Interrupted sync/download             | Prior text snapshot remains usable; pending images resume                                      |
| Reconnect after recipe changes        | Additions/edits/deletions applied; removed photos cleaned up                                   |
| Backend outage with Wi-Fi connected   | Cached browsing continues; failed sync does not erase recipes                                  |
| Expired Clerk session offline         | Public browsing still boots without authentication                                             |
| Offline admin/edit/upload/delete      | Online-required state; no queued writes or cached admin responses                              |
| Storage refusal/quota pressure        | Text preserved where possible; photo completeness is not overstated                            |
| New deployment with an old tab open   | No forced reload; accepted update transitions cleanly                                          |
| Browser tab versus standalone         | Both usable; header and text fit narrow/mobile and desktop widths                              |

Add focused unit tests for snapshot reconciliation, filter parity, cache-key generation, route exclusions, and schema migration. Use Playwright against a production server for network-loss, cold-start, deep-link, update, and cache-isolation scenarios. Test actual iPhone Safari/Home Screen and Android Chrome installation separately; desktop emulation does not prove OS splash behavior.

Run `npm run typecheck`, `npm run format:write`, and `npm run build` after implementation changes. The existing `npm run lint` works on the installed Next.js 15.5 release but invokes deprecated `next lint`; use `npx eslint` for focused checks and migrate the lint script separately before upgrading to Next.js 16.

## Deferred Details And Platform Limits

- Serwist 9.5 is integrated into the Next.js 15 production webpack build. Service-worker registration is intentionally disabled during Turbopack development.
- The initial photo policy uses 960-pixel renditions, three concurrent downloads, a 100 MiB maximum budget, and the available device-storage estimate. Adjust these limits if the collection grows substantially.
- Verify startup-image media queries on the target physical devices. The prepared set covers known display configurations, not every future device.
- Native splash timing and appearance are controlled by the browser/OS. A matching image does not guarantee a splash is shown on every launch.
- iOS does not guarantee immersive fullscreen, persistent storage approval, background synchronization, or permanent retention of cached data.
- An initial successful online download is mandatory. Browser storage can be evicted or cleared by the user, and the app must recover honestly.
- No push notifications, offline admin writes, native app-store packaging, or authentication redesign are included.

## Implementation Status

- Installation: typed standalone manifest, standard/maskable icons, Apple launch metadata, safe-area handling, conditional install control, and user-opened iOS instructions.
- Startup: provider-free static shell, build-revision precaching, explicit offline deep-link state, local history navigation, and public-only network/5xx fallbacks.
- Data: atomic IndexedDB snapshots, private-field exclusion, immediate saved-data hydration, live updates, foreground/reconnect refresh, retry, clear, and rollback on failed replacements.
- Photos: parsed markdown image references, immutable cover keys, same-origin optimized downloads, bounded concurrency, transient retry, device-aware storage budget, obsolete-photo cleanup, and missing-photo fallback.
- Admin: cached documents and mutations excluded; offline controls disabled; authenticated HTTP mutations have no deferred write queue. Existing authentication and server authorization remain unchanged.
- Updates: user-accepted waiting-worker activation; versioned shell caches and previous hashed-asset lookup; cache cleanup is limited to owned versions and deferred when multiple tabs are present.

### Automated Verification

`npm run test:unit` covers filter parity, complete snapshot reconciliation, transaction rollback, image-key stability, markdown reference parsing, and public/admin route boundaries.

`npm run test:pwa` runs against a production server on port 3110. It covers an unvisited recipe in a cold offline tab with Clerk requests blocked; cached photos; offline reload and local back navigation; local search/difficulty filters; cold admin fallback and cache exclusion; clearing saved data; manifest/icon availability; quota exhaustion preserving text; and live public synchronization without persisting author identity. Browser photo responses are deterministic test fixtures. Desktop and 320/375-pixel mobile screenshots check framing and overflow.

### Remaining Manual Verification

- Physical iPhone/iPad Add to Home Screen, launch-image matching, safe areas, and app termination/relaunch in airplane mode.
- Physical Android installation and OS-generated splash rendering.
- Signed-in admin create/edit/delete/upload regression with the existing Clerk `convex` JWT template. No administrative data was mutated during automated testing.
- A real two-deployment update while multiple installed-app tabs remain open, including accepting and declining the update prompt.
- Device-specific storage persistence/eviction and externally hosted markdown-image availability.

### Development And Recovery

Use `npm run dev` for normal development without a service worker. For offline verification, run `npm run build` then `npm run start`; localhost is a secure-context exception, but physical mobile installation requires HTTPS.

The worker bundle at `public/sw.js` is generated by the build and ignored by Git, Prettier, ESLint, and TypeScript. Do not commit or hand-edit it. Regenerate branding using `npm run assets:generate`.

To recover a broken installation, unregister the `/sw.js` registration in browser developer tools, remove only caches whose names begin with `bensrecipes`, and remove the `bensrecipes-offline` IndexedDB database if its saved data must also be reset. Reload online to reinstall and synchronize. The in-app clear action removes recipe/photo storage without removing the app shell.
