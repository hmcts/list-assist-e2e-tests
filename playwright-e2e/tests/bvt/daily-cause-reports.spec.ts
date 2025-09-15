import { expect, test } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import {
  CaseDetailsPage,
  CaseSearchPage,
  HearingSchedulePage,
  HomePage,
} from "../../page-objects/pages/index.ts";
import { SessionBookingPage } from "../../page-objects/pages/hearings/session-booking.po.ts";

test.describe("Daily Cause List Report tests @daily-cause-list-tests", () => {
  test.slow();

  test("Should release a session and generate both external and internal hearing list reports", async ({
    page,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
    loginPage,
    addNewCasePage,
    editNewCasePage,
  }) => {
    const caseNumber = process.env.HMCTS_CASE_NUMBER;
    const caseName = process.env.CASE_NAME;

    if (!caseNumber || !caseName) {
      throw new Error(
        "Missing required env vars: HMCTS_CASE_NUMBER or CASE_NAME",
      );
    }

    const {
      CASE_LISTING_REGION_WALES,
      CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      CASE_LISTING_COLUMN_ONE,
      CASE_LISTING_SESSION_DURATION_1_00,
      CASE_LISTING_HEARING_TYPE_APPLICATION,
      CASE_LISTING_CANCEL_REASON_AMEND,
      SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
    } = sessionBookingPage.CONSTANTS;

    const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
    const formattedReportDate = dataUtils.getFormattedDateForReportAssertion();

    await test.step("Login and prepare test case", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
      await hearingSchedulePage.sidebarComponent.emptyCaseCart();
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(caseNumber);
      await expect(editNewCasePage.caseNameField).toHaveText(caseName);
    });

    await test.step("Clear existing schedule and create new released session", async () => {
      await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

      await sessionBookingPage.updateAdvancedFilterConfig(
        CASE_LISTING_REGION_WALES,
        CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      );

      await hearingSchedulePage.clearDownSchedule(
        SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
      );

      await createHearingSession(
        {
          homePage,
          caseSearchPage,
          caseDetailsPage,
          hearingSchedulePage,
          sessionBookingPage,
        },
        {
          roomName: CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
          column: CASE_LISTING_COLUMN_ONE,
          caseNumber,
          sessionDuration: CASE_LISTING_SESSION_DURATION_1_00,
          hearingType: CASE_LISTING_HEARING_TYPE_APPLICATION,
          cancelReason: CASE_LISTING_CANCEL_REASON_AMEND,
          sessionStatus: CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
        },
      );
    });

    await test.step("Generate external hearing list report", async () => {
      await viewReportsPage.reportRequestPageActions(
        todayDate,
        CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
      );
    });

    await test.step("Generate internal hearing list report (damages)", async () => {
      await viewReportsPage.reportRequestPageActions(
        todayDate,
        CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
        viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
      );
    });
  });

  // Reusable helper
  async function createHearingSession(
    pages: {
      homePage: HomePage;
      caseSearchPage: CaseSearchPage;
      caseDetailsPage: CaseDetailsPage;
      hearingSchedulePage: HearingSchedulePage;
      sessionBookingPage: SessionBookingPage;
    },
    roomData: {
      roomName: string;
      column: string;
      caseNumber: string;
      sessionDuration: string;
      hearingType: string;
      cancelReason: string;
      sessionStatus: string;
    },
  ) {
    const {
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      sessionBookingPage,
    } = pages;

    await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();
    await homePage.upperbarComponent.currentCaseDropdownButton.click();

    await expect(
      homePage.upperbarComponent.currentCaseDropdownList,
    ).toContainText(homePage.upperbarComponent.currentCaseDropDownItems);

    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(roomData.caseNumber);
    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();

    await hearingSchedulePage.scheduleHearingWithBasket(
      roomData.roomName,
      roomData.column,
      roomData.caseNumber,
    );

    await sessionBookingPage.bookSession(
      roomData.sessionDuration,
      roomData.sessionStatus,
    );

    await expect(
      hearingSchedulePage.confirmListingReleasedStatus,
    ).toBeVisible();
  }
});
