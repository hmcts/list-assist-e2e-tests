import { expect, test } from "../fixtures";
import { config } from "../utils";
import { SessionBookingPage } from "../page-objects/pages/hearings/session-booking.po.ts";
import {
  CaseDetailsPage,
  CaseSearchPage,
  HearingSchedulePage,
  HomePage,
} from "../page-objects/pages";

test.describe("Daily Cause List Report tests @daily-cause-list-tests", () => {
  test.slow();
  // test.describe.configure({mode: "serial"});
  //
  // test.beforeEach(
  //     async ({
  //                page,
  //                loginPage,
  //                addNewCasePage,
  //                caseSearchPage,
  //                editNewCasePage,
  //                hearingSchedulePage,
  //            }) => {
  //         await page.goto(config.urls.baseUrl);
  //         await loginPage.login(config.users.testUser);
  //         //empties cart if there is anything present
  //         await hearingSchedulePage.sidebarComponent.emptyCaseCart();
  //         //search for the case
  //         await addNewCasePage.sidebarComponent.openSearchCasePage();
  //         await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
  //         await expect(editNewCasePage.caseNameField).toHaveText(
  //             process.env.CASE_NAME as string,
  //         );
  //     },
  // );

  test.only('List "Released" session and Generate report via reports menu', async ({
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
    page,
    loginPage,
    addNewCasePage,
    editNewCasePage,
  }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser);
    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();
    //search for the case
    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await expect(editNewCasePage.caseNameField).toHaveText(
      process.env.CASE_NAME as string,
    );

    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    );

    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );

    // Test data
    const roomData = {
      roomName:
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
      sessionDuration:
        sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType:
        sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason:
        sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await createHearingSession(
      roomData.caseNumber,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      roomData,
      sessionBookingPage,
    );

    const reportData = {
      //numeric, current day of the month
      todayDate: dataUtils.generateDateInYyyyMmDdNoSeparators(0),
      locality:
        viewReportsPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      location:
        viewReportsPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      jurisdiction: viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
      service: viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
    };

    //open reports menu and check generated External hearing list report
    await viewReportsPage.reportRequestPageActions(
      reportData.todayDate,
      reportData.locality,
      reportData.location,
      reportData.jurisdiction,
      dataUtils.getFormattedDateForReportAssertion(),
    );

    // open reports menu and check generated Internal hearing list report
    await viewReportsPage.reportRequestPageActions(
      reportData.todayDate,
      reportData.locality,
      reportData.location,
      reportData.jurisdiction,
      dataUtils.getFormattedDateForReportAssertion(),
      reportData.service,
    );
  });

  async function createHearingSession(
    caseName: string,
    homePage: HomePage,
    caseSearchPage: CaseSearchPage,
    caseDetailsPage: CaseDetailsPage,
    hearingSchedulePage: HearingSchedulePage,
    roomData: {
      roomName: string;
      column: string;
      caseNumber: string;
      sessionDuration: string;
      hearingType: string;
      cancelReason: string;
    },
    sessionBookingPage: SessionBookingPage,
  ) {
    // Check if the close case button in upper bar is present
    await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();
    //check current case drop down menu in upper bar
    await expect(
      homePage.upperbarComponent.currentCaseDropdownButton,
    ).toBeVisible();
    await homePage.upperbarComponent.currentCaseDropdownButton.click();

    await expect(
      homePage.upperbarComponent.currentCaseDropdownList,
    ).toContainText(homePage.upperbarComponent.currentCaseDropDownItems);

    //add case to cart
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(caseName);

    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

    //go to hearing schedule page
    await expect(hearingSchedulePage.sidebarComponent.sidebar).toBeVisible();
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();

    //schedule hearing
    await hearingSchedulePage.waitForLoad();

    await hearingSchedulePage.scheduleHearingWithBasket(
      roomData.roomName,
      roomData.column,
      roomData.caseNumber,
    );

    //session booking page
    await sessionBookingPage.bookSession(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
    );

    //confirm listing
    await expect(
      hearingSchedulePage.confirmListingReleasedStatus,
    ).toBeVisible();
  }
});
