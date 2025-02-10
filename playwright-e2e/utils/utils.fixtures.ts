import { Page } from "playwright/test";
import { AxeUtils } from "./axe.utils";
import { BrowserUtils } from "./browser.utils";
import { config, Config } from "./config.utils";

export interface UtilsFixtures {
  config: Config;
  axeUtils: AxeUtils;
  browserUtils: BrowserUtils;
  lighthousePage: Page;
}

export const utilsFixtures = {
  config: async ({}, use) => {
    await use(config);
  },
  axeUtils: async ({ page }, use) => {
    await use(new AxeUtils(page));
  },
  browserUtils: async ({ browser }, use) => {
    await use(new BrowserUtils(browser));
  },
};
