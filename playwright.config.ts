import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  use: {
    baseURL: "http://localhost:3110",
    trace: "retain-on-failure",
    channel: "chromium",
  },
  webServer: {
    command: "npm run start -- --port 3110",
    url: "http://localhost:3110/offline",
    reuseExistingServer: !process.env.CI,
  },
});
