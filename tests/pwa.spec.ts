import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("cold offline launch opens an unvisited recipe and excludes admin", async ({
  page,
  context,
}) => {
  const id = "a".repeat(32);
  await context.route("**/*clerk*", (route) => route.abort());
  await page.goto("/offline");
  await expect(
    page.getByText("No saved recipes", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Data on This Device" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Clear saved recipes" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await page.evaluate(async (recipeId) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("bensrecipes-offline", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(["recipes", "metadata"], "readwrite");
      transaction.objectStore("recipes").put({
        _id: recipeId,
        _creationTime: 1,
        title: "Offline test recipe",
        content: "# Offline test recipe\n\n## Ingredients\n\n- Rice",
        tags: ["Dinner"],
        difficulty: "easy",
        totalTime: 20,
        cuisine: "Italian",
        imageUrl: "/logo.png",
      });
      transaction.objectStore("recipes").put({
        _id: "b".repeat(32),
        _creationTime: 2,
        title: "Weekend Cake",
        content: "# Weekend Cake\n\nFlour",
        tags: ["Dessert"],
        difficulty: "hard",
        totalTime: 70,
        cuisine: "British",
        imageUrl: null,
      });
      transaction
        .objectStore("metadata")
        .put({ tags: ["Dinner", "Dessert"], syncedAt: Date.now() }, "snapshot");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    const cache = await caches.open("bensrecipes-photos-v1");
    await cache.put(
      "/__offline/images/v1/" + encodeURIComponent("source:/logo.png"),
      await fetch("/logo.png"),
    );
  }, id);
  await page.close();
  await context.setOffline(true);
  const coldPage = await context.newPage();
  await coldPage.goto(`/recipes/${id}`);
  await expect(
    coldPage.getByRole("heading", { name: "Offline test recipe" }),
  ).toBeVisible();
  await expect(coldPage.getByText("Rice", { exact: true })).toBeVisible();
  const beforeReload = await coldPage.evaluate(() => performance.timeOrigin);
  await coldPage
    .reload({ waitUntil: "domcontentloaded" })
    .catch((error: unknown) => {
      if (!String(error).includes("net::ERR_ABORTED")) throw error;
    });
  await expect
    .poll(() =>
      coldPage
        .evaluate(() => performance.timeOrigin)
        .catch((error: unknown) => {
          if (String(error).includes("Execution context was destroyed"))
            return beforeReload;
          throw error;
        }),
    )
    .not.toBe(beforeReload);
  await expect(
    coldPage.getByRole("heading", { name: "Offline test recipe" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      coldPage
        .getByAltText("Offline test recipe")
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await coldPage
    .getByRole("link", { name: "Recipes", exact: true })
    .last()
    .click();
  await expect(
    coldPage.getByRole("heading", { name: "All Recipes" }),
  ).toBeVisible();
  await coldPage
    .getByRole("button", { name: "Search recipes", exact: true })
    .click();
  await coldPage.getByPlaceholder("Search recipes…").fill("Weekend");
  await expect(
    coldPage.getByRole("heading", { name: "Weekend Cake" }),
  ).toBeVisible();
  await expect(
    coldPage.getByRole("heading", { name: "Offline test recipe" }),
  ).not.toBeVisible();
  await coldPage.getByPlaceholder("Search recipes…").fill("");
  await coldPage.getByRole("radio", { name: "Easy", exact: true }).click();
  await expect(
    coldPage.getByRole("heading", { name: "Offline test recipe" }),
  ).toBeVisible();
  await expect(
    coldPage.getByRole("heading", { name: "Weekend Cake" }),
  ).not.toBeVisible();
  await coldPage
    .getByRole("link", { name: /Offline test recipe/ })
    .first()
    .click();
  await expect(
    coldPage.getByRole("heading", { name: "Offline test recipe" }),
  ).toBeVisible();
  await coldPage.goBack();
  await expect(
    coldPage.getByRole("heading", { name: "All Recipes" }),
  ).toBeVisible();
  const adminPage = await context.newPage();
  await adminPage.goto("http://localhost:3110/admin");
  await expect(
    adminPage.getByRole("heading", { name: "Connection required" }),
  ).toBeVisible();
  const keys = await adminPage.evaluate(async () => {
    const results: string[] = [];
    for (const name of await caches.keys()) {
      if (!name.startsWith("bensrecipes")) continue;
      for (const request of await (await caches.open(name)).keys())
        results.push(new URL(request.url).pathname);
    }
    return results;
  });
  expect(keys).not.toContain("/admin");
  expect(keys).not.toContain("/sign-in");
  await coldPage.getByRole("button", { name: "Settings", exact: true }).click();
  await coldPage.getByRole("button", { name: "Clear saved recipes" }).click();
  await coldPage.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(
    coldPage.getByRole("button", { name: "Clear saved recipes" }),
  ).toBeDisabled();
  await coldPage.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    coldPage.getByText("No saved recipes", { exact: true }),
  ).toBeVisible();
  expect(
    await coldPage.evaluate(
      async () =>
        (await (await caches.open("bensrecipes-photos-v1")).keys()).length,
    ),
  ).toBe(0);
});

test("manifest references standalone launch and prepared install icons", async ({
  request,
}) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = (await response.json()) as {
    start_url: string;
    display: string;
    icons: { src: string; purpose: string }[];
  };
  expect(manifest.start_url).toBe("/recipes");
  expect(manifest.display).toBe("standalone");
  expect(new Set(manifest.icons.map((icon) => icon.purpose))).toEqual(
    new Set(["any", "maskable"]),
  );
  for (const icon of manifest.icons)
    expect((await request.get(icon.src)).ok()).toBe(true);
});

test("photo quota exhaustion leaves recipe text usable and reports incomplete downloads", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const photo = await readFile("public/logo.png");
  await context.addInitScript(() =>
    Object.defineProperty(navigator.storage, "estimate", {
      value: () => Promise.resolve({ quota: 1024, usage: 1024 }),
    }),
  );
  await context.route("**/_next/image?**", (route) =>
    route.fulfill({ contentType: "image/png", body: photo }),
  );
  await page.goto("/recipes");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByText("Recipes saved; photos incomplete", { exact: true }),
  ).toBeVisible({ timeout: 45000 });
  const href = await page
    .locator('main .group:has(img) a[href^="/recipes/"]')
    .first()
    .getAttribute("href");
  if (!href)
    throw new Error("A public recipe must be available for the quota test");
  await page.close();
  await context.setOffline(true);
  const offline = await context.newPage();
  await offline.goto(href);
  await expect(
    offline.getByText("Photo unavailable offline", { exact: true }).first(),
  ).toBeVisible();
  await expect(offline.locator(".prose")).toBeVisible();
});

test("public synchronization saves public fields and downloads photos for offline reading", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const photo = await readFile("public/logo.png");
  await context.route("**/_next/image?**", (route) =>
    route.fulfill({ contentType: "image/png", body: photo }),
  );
  await page.goto("/recipes");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByText("Available offline", { exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByText("Available offline", { exact: true }),
  ).toBeVisible({ timeout: 45000 });
  const saved = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("bensrecipes-offline", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const recipes = await new Promise<
      { _id: string; title: string; imageUrl?: string; authorId?: string }[]
    >((resolve, reject) => {
      const request = db.transaction("recipes").objectStore("recipes").getAll();
      request.onsuccess = () =>
        resolve(
          request.result as {
            _id: string;
            title: string;
            imageUrl?: string;
            authorId?: string;
          }[],
        );
      request.onerror = () => reject(request.error);
    });
    db.close();
    return recipes;
  });
  expect(saved.length).toBeGreaterThan(0);
  expect(saved.every((entry) => !("authorId" in entry))).toBe(true);
  const recipe = saved.find((entry) => entry.imageUrl);
  expect(recipe).toBeDefined();
  await page.close();
  await context.setOffline(true);
  const offline = await context.newPage();
  await offline.goto(`/recipes/${recipe!._id}`);
  await expect(
    offline.getByRole("heading", { name: recipe!.title, exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      offline
        .getByAltText(recipe!.title)
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    )
    .toBe(true);
  for (const width of [320, 375, 1280]) {
    await offline.setViewportSize({ width, height: 812 });
    expect(
      await offline.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await offline.screenshot({
      path: `test-results/offline-${width}.png`,
      fullPage: true,
    });
    await offline
      .getByRole("button", { name: "Settings", exact: true })
      .click();
    await expect(
      offline.getByRole("heading", { name: "Data on This Device" }),
    ).toBeVisible();
    await expect(
      offline.getByRole("button", { name: "Sync recipes" }),
    ).toBeDisabled();
    expect(
      await offline.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await offline.screenshot({
      path: `test-results/settings-${width}.png`,
      fullPage: true,
    });
    await offline.getByRole("button", { name: "Close", exact: true }).click();
  }
});
