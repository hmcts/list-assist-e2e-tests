import { CommonConfig, ProjectsConfig } from "@hmcts/playwright-common";
import { defineConfig } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...CommonConfig.recommended,
  testDir: "./playwright-e2e",
  snapshotDir: "./playwright-e2e/snapshots",
  reporter: [
    [
      "blob",
      {
        outputDir: process.env.BLOB_REPORT_DIR || "blob-report",
      },
    ],
    ["html", { open: "never", collapsed: true }],
    ["list"],
    [
      "junit",
      {
        outputFile: "test-results/results.xml",
      },
    ],
  ],

  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "teardown",
      testMatch: /global\.teardown\.ts/,
    },
    {
      ...ProjectsConfig.chrome,
      timeout: 360_000,
      dependencies: ["setup"],
    },
    {
      ...ProjectsConfig.edge,
      timeout: 360_000,
      dependencies: ["setup"],
    },
    {
      ...ProjectsConfig.firefox,
      timeout: 360_000,
      dependencies: ["setup"],
    },
    {
      ...ProjectsConfig.webkit,
      dependencies: ["setup"],
    },
  ],
});
