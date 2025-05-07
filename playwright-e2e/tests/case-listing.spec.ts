import { expect, test } from '../fixtures';
import { HomePage, CaseSearchPage, CaseDetailsPage, HearingSchedulePage } from '../page-objects/pages';
import { SessionBookingPage } from '../page-objects/pages/hearings/session-booking.po';
import { config } from '../utils';

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe('Case listing @case-listing', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, hearingSchedulePage }) => {
    await page.goto(config.urls.baseUrl);
    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();
  });

  test('List "Released" session and Generate report via reports menu @smoke', async ({
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
  }) => {
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS.CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    );

    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    );

    // Test data
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await createHearingSession(
      process.env.CASE_NAME as string,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      roomData,
      sessionBookingPage,
    );

    //test data
    const reportData = {
      //numeric, current day of the month
      dateFrom: dataUtils.getTodaysDayAsDd(),
      dateTo: dataUtils.getTodaysDayAsDd(),

      locality: viewReportsPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      location: viewReportsPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      jurisdiction: viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
      service: viewReportsPage.CONSTANTS.SERVICE_DIVORCE,
    };

    //open reports menu and check generated report
    await viewReportsPage.reportRequestPageActions(
      reportData.dateFrom,
      reportData.dateTo,
      reportData.locality,
      reportData.location,
      reportData.jurisdiction,
      reportData.service,
      dataUtils.getFormattedDateForReportAssertion(),
    );
  });

  test('List "Released" session and Generate report via P&I Dashboard @smoke', async ({
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    automaticBookingDashboardPage,
    dataUtils,
  }) => {
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS.CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );

    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );
    // Test data
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await createHearingSession(
      process.env.CASE_NAME as string,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      roomData,
      sessionBookingPage,
    );

    await homePage.sidebarComponent.openAutomaticBookingDashboard();
    await automaticBookingDashboardPage.createPublishExternalListsHeader.isVisible();
    await automaticBookingDashboardPage.publishExternalListsCreate.click();

    await automaticBookingDashboardPage.populateCreatePublishExternalListsForm(
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_REGION_WALES,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_FAMILY_JURISDICTION,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_SERVICE_DIVORCE_OPTION,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_DAILY_MIXED_CAUSE_LIST_SSRS,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_VERSION_TYPE,
    );

    //assert that the report preview is generated and contains expected elements
    await automaticBookingDashboardPage.assertPreviewReport(
      dataUtils.getFormattedDateForReportAssertion(),
      automaticBookingDashboardPage.CONSTANTS.CIVIL_AND_FAMILY_DAILY_CAUSE_LIST,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );

    //assert publish button is now visible
    await expect(automaticBookingDashboardPage.publishButton).toBeVisible();
  });
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
  await expect(homePage.upperbarComponent.currentCaseDropdownButton).toBeVisible();
  await homePage.upperbarComponent.currentCaseDropdownButton.click();
  await expect(homePage.upperbarComponent.currentCaseDropdownList).toContainText(
    homePage.upperbarComponent.currentCaseDropDownItems,
  );

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

  await hearingSchedulePage.scheduleHearingWithBasket(roomData.roomName, roomData.column, roomData.caseNumber);

  //session booking page
  await sessionBookingPage.bookSession(
    sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
    sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
  );

  //Check Listing iframe
  await sessionBookingPage.checkingListingIframe();

  //confirm listing
  await expect(hearingSchedulePage.confirmListingReleasedStatus).toBeVisible();
}
