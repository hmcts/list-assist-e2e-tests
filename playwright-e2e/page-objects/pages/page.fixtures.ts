import { CaseDetailsPage } from "./cases/case-details.po";
import { CaseSearchPage } from "./cases/case-search.po";
import { BookSessionPage } from "./hearings/book-session.po";
import { HearingSchedulePage } from "./hearings/hearing-schedule.po";
import { HomePage } from "./home.po";
import { LoginPage } from "./login.po";
import { AddNewCasePage } from "./cases/add-new-case.po.ts";
import { EditNewCasePage } from "./cases/edit-case.po.ts";
import { ListACase } from "./cases/list-a-case.po.ts";

export interface PageFixtures {
  loginPage: LoginPage;
  homePage: HomePage;
  hearingSchedulePage: HearingSchedulePage;
  caseSearchPage: CaseSearchPage;
  caseDetailsPage: CaseDetailsPage;
  bookSessionPage: BookSessionPage;
  addNewCasePage: AddNewCasePage;
  editNewCasePage: EditNewCasePage;
  listACase: ListACase;
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
  addNewCasePage: async ({ page }, use) => {
    await use(new AddNewCasePage(page));
  },
  editNewCasePage: async ({ page }, use) => {
    await use(new EditNewCasePage(page));
  },
  listACase: async ({ page }, use) => {
    await use(new ListACase(page));
  },
};
