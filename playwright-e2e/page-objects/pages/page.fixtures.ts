import { CaseDetailsPage } from "./cases/case-details.po";
import { CaseSearchPage } from "./cases/case-search.po";
import { SessionBookingPage } from "./hearings/session-booking.po.ts";
import { HearingSchedulePage } from "./hearings/hearing-schedule.po";
import { HomePage } from "./home.po";
import { LoginPage } from "./login.po";
import { AddNewCasePage } from "./cases/add-new-case.po.ts";
import { EditNewCasePage } from "./cases/edit-case.po.ts";
import { NewParticipantPage } from "./participants/new-participants.po.ts";
import { EditParticipantPage } from "./participants/edit-participants.po.ts";
import { ViewReportsPage } from "./reports/view-reports.po.ts";
import { AutomaticBookingDashboardPage } from "./administration/automatic-booking-dashboard.po.ts";
import { ListingRequirementsPage } from "./cases/listing-requirements.po.ts";
import { MultiDayCartPage } from "../carts/multi-day-cart.po.ts";
import { CreateUserPage } from "./administration/add-user.po.ts";
import { CaseHistoryPage } from "./cases/case-history.po.ts";
import { Cath } from "../cath/check-report-in-cath.ts";

export interface PageFixtures {
  loginPage: LoginPage;
  homePage: HomePage;
  hearingSchedulePage: HearingSchedulePage;
  caseSearchPage: CaseSearchPage;
  caseDetailsPage: CaseDetailsPage;
  sessionBookingPage: SessionBookingPage;
  addNewCasePage: AddNewCasePage;
  editNewCasePage: EditNewCasePage;
  newParticipantsPage: NewParticipantPage;
  editParticipantsPage: EditParticipantPage;
  viewReportsPage: ViewReportsPage;
  automaticBookingDashboardPage: AutomaticBookingDashboardPage;
  listingRequirementsPage: ListingRequirementsPage;
  multiDayCartPage: MultiDayCartPage;
  createUserPage: CreateUserPage;
  caseHistoryPage: CaseHistoryPage;
  cath: Cath;
}

export const pageFixtures = {
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  createUserPage: async ({ page }, use) => {
    await use(new CreateUserPage(page));
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
  sessionBookingPage: async ({ page }, use) => {
    await use(new SessionBookingPage(page));
  },
  addNewCasePage: async ({ page }, use) => {
    await use(new AddNewCasePage(page));
  },
  editNewCasePage: async ({ page }, use) => {
    await use(new EditNewCasePage(page));
  },
  newParticipantsPage: async ({ page }, use) => {
    await use(new NewParticipantPage(page));
  },
  editParticipantsPage: async ({ page }, use) => {
    await use(new EditParticipantPage(page));
  },
  viewReportsPage: async ({ page }, use) => {
    await use(new ViewReportsPage(page));
  },
  automaticBookingDashboardPage: async ({ page }, use) => {
    await use(new AutomaticBookingDashboardPage(page));
  },
  listingRequirementsPage: async ({ page }, use) => {
    await use(new ListingRequirementsPage(page));
  },
  multiDayCartPage: async ({ page }, use) => {
    await use(new MultiDayCartPage(page));
  },
  caseHistoryPage: async ({ page }, use) => {
    await use(new CaseHistoryPage(page));
  },
  cath: async ({ page }, use) => {
    await use(new Cath(page));
  },
};
