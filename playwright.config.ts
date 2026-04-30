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
      testIgnore: ["**/bvt/**"],
    },
    {
      ...ProjectsConfig.edge,
      timeout: 360_000,
      dependencies: ["setup"],
      testIgnore: ["**/bvt/**"],
    },
    {
      ...ProjectsConfig.firefox,
      timeout: 360_000,
      dependencies: ["setup"],
      testIgnore: ["**/bvt/**"],
    },
    {
      ...ProjectsConfig.webkit,
      dependencies: ["setup"],
      testIgnore: ["**/bvt/**"],
    },
    {
      ...ProjectsConfig.chrome,
      name: "bvt-chrome",
      timeout: 360_000,
      testMatch: ["**/bvt/**"],
    },
    {
      ...ProjectsConfig.edge,
      name: "bvt-edge",
      timeout: 360_000,
      testMatch: ["**/bvt/**"],
    },
    {
      ...ProjectsConfig.firefox,
      name: "bvt-firefox",
      timeout: 360_000,
      testMatch: ["**/bvt/**"],
    },
    {
      ...ProjectsConfig.webkit,
      name: "bvt-webkit",
      testMatch: ["**/bvt/**"],
    },
  ],
});
