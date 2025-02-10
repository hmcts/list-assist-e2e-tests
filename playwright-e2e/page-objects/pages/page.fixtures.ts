import { Page } from "@playwright/test";
import { IdamPage } from "./idam.po";

export interface PageFixtures {
  determinePage: Page;
  idamPage: IdamPage;
}

export const pageFixtures = {
  idamPage: async ({ determinePage }, use) => {
    await use(new IdamPage(determinePage));
  },
};
