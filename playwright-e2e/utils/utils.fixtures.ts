import { AxeUtils } from "@hmcts/playwright-common";
import { Page } from "playwright/test";
import { BrowserUtils } from "./browser.utils";
import { config, Config } from "./config.utils";
import { DataUtils } from "./data.utils";

export interface UtilsFixtures {
  config: Config;
  axeUtils: AxeUtils;
  browserUtils: BrowserUtils;
  lighthousePage: Page;
  dataUtils: DataUtils;
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
  dataUtils: async ({}, use) => {
    await use(new DataUtils());
  },
};
