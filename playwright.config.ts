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
    // BVT projects - no setup dependency
    {
      ...ProjectsConfig.chrome,
      name: "chrome-bvt",
      timeout: 360_000,
      testDir: "./playwright-e2e/tests/bvt",
    },
    {
      ...ProjectsConfig.edge,
      name: "edge-bvt",
      timeout: 360_000,
      testDir: "./playwright-e2e/tests/bvt",
    },
    {
      ...ProjectsConfig.firefox,
      name: "firefox-bvt",
      timeout: 360_000,
      testDir: "./playwright-e2e/tests/bvt",
    },
    {
      ...ProjectsConfig.webkit,
      name: "webkit-bvt",
      testDir: "./playwright-e2e/tests/bvt",
    },
    // Regression projects - with setup dependency
    {
      ...ProjectsConfig.chrome,
      name: "chrome-regression",
      timeout: 360_000,
      testDir: "./playwright-e2e/tests/regression",
      dependencies: ["setup"],
    },
    {
      ...ProjectsConfig.edge,
      name: "edge-regression",
      timeout: 360_000,
      testDir: "./playwright-e2e/tests/regression",
      dependencies: ["setup"],
    },
    {
      ...ProjectsConfig.firefox,
      name: "firefox-regression",
      timeout: 360_000,
      testDir: "./playwright-e2e/tests/regression",
      dependencies: ["setup"],
    },
    {
      ...ProjectsConfig.webkit,
      name: "webkit-regression",
      testDir: "./playwright-e2e/tests/regression",
      dependencies: ["setup"],
    },
    // Generic projects for tag-based runs (no testDir restriction, no setup dependency)
    {
      ...ProjectsConfig.chrome,
      name: "chrome",
      timeout: 360_000,
    },
    {
      ...ProjectsConfig.edge,
      name: "edge",
      timeout: 360_000,
    },
    {
      ...ProjectsConfig.firefox,
      name: "firefox",
      timeout: 360_000,
    },
    {
      ...ProjectsConfig.webkit,
      name: "webkit",
    },
  ],
});
