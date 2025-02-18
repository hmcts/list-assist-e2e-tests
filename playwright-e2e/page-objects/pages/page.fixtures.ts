import { Page } from "@playwright/test";
import { CaseDetailsPage } from "./cases/case-details.po";
import { CaseSearchPage } from "./cases/case-search.po";
import { BookSessionPage } from "./hearings/book-session.po";
import { HearingSchedulePage } from "./hearings/hearing-schedule.po";
import { HomePage } from "./home.po";
import { LoginPage } from "./login.po";

export interface PageFixtures {
  determinePage: Page;
  loginPage: LoginPage;
  homePage: HomePage;
  hearingSchedulePage: HearingSchedulePage;
  caseSearchPage: CaseSearchPage;
  caseDetailsPage: CaseDetailsPage;
  bookSessionPage: BookSessionPage;
}

export const pageFixtures = {
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  hearingSchedulePage: async ({ page }, use) => {
    await use(new HearingSchedulePage(page));
  },
  caseSearchPage: async ({ page }, use) => {
    await use(new CaseSearchPage(page));
  },
  caseDetailsPage: async ({ page }, use) => {
    await use(new CaseDetailsPage(page));
  },
  bookSessionPage: async ({ page }, use) => {
    await use(new BookSessionPage(page));
  },
};
