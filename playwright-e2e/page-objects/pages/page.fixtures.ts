import { Page } from "@playwright/test";
import { HomePage } from "./home.po";
import { LoginPage } from "./login.po";

export interface PageFixtures {
  determinePage: Page;
  loginPage: LoginPage;
  homePage: HomePage;
}

export const pageFixtures = {
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
};
