import { test as baseTest } from "@playwright/test";
import { PageFixtures, pageFixtures } from "./page-objects/pages";
import { UtilsFixtures, utilsFixtures } from "./utils";

export type CustomFixtures = PageFixtures & UtilsFixtures;

export const test = baseTest.extend<CustomFixtures>({
  // Override page fixture to add global error handling
  page: async ({ page }, use) => {
    // Suppress non-critical measurement errors that occur during page rendering
    page.on("pageerror", (error: Error) => {
      // Suppress clientHeight and similar measurement errors
      if (
        error.message?.includes("clientHeight") ||
        error.message?.includes("clientWidth") ||
        error.message?.includes("offsetHeight") ||
        error.message?.includes("offsetWidth") ||
        (error.message?.includes("Cannot read properties") &&
          error.message?.includes("of undefined"))
      ) {
        console.warn(`[SUPPRESSED] Measurement error: ${error.message}`);
        // Don't rethrow - these are non-critical UI measurement errors
      } else {
        // Log critical errors for debugging
        console.error("Critical page error:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        // Still report it but don't prevent test continuation
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("clientHeight") ||
          text.includes("clientWidth") ||
          text.includes("Cannot read properties of undefined")
        ) {
          console.warn(`[BROWSER CONSOLE] ${text}`);
        }
      }
    });

    await use(page);
  },
  ...pageFixtures,
  ...utilsFixtures,
});

export const expect = test.expect;
