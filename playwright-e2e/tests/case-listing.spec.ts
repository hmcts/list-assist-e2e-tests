import { expect, test } from '../fixtures';
import { HomePage, CaseSearchPage, CaseDetailsPage, HearingSchedulePage } from '../page-objects/pages';
import { SessionBookingPage } from '../page-objects/pages/hearings/session-booking.po';
import { config } from '../utils';

test.use({
  storageState: config.users.testUser.sessionFile,
});

let caseCreated = false;
let hmctsCaseNumber: string;
let caseName: string;

test.describe('Case listing @case-listing', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, homePage, hearingSchedulePage, sessionBookingPage, addNewCasePage }) => {
    await page.goto(config.urls.baseUrl);
    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    //clears sessions at start of test class
    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
    );

    //add a single case for all tests in the class in instead of creating a new case for each test
    //sets caseCreated to true so that it doesn't create a new case for each test in test class
    if (caseCreated === false) {
      //add new case
      await homePage.sidebarComponent.openAddNewCasePage();
      hmctsCaseNumber = 'HMCTS_CN_' + addNewCasePage.hmctsCaseNumber;
      caseName = 'AUTO_' + addNewCasePage.hmctsCaseNumber;
      //Test data
      const caseData = {
        hmctsCaseNumberHeaderValue: addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
        caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
        jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
        service: addNewCasePage.CONSTANTS.SERVICE_DIVORCE,
        caseType: addNewCasePage.CONSTANTS.DECREE_ABSOLUTE_CASE_TYPE,
        region: addNewCasePage.CONSTANTS.REGION_WALES,
        cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
        hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
        currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
      };

      await addNewCasePage.addNewCaseWithMandatoryData(caseData, hmctsCaseNumber, caseName);
      caseCreated = true;
    }
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
    // Test data
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: hmctsCaseNumber,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await createHearingSession(
      caseName,
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

      locality: viewReportsPage.CONSTANTS.LOCALITY_LEICESTER_COMBINED_COURT,
      location: viewReportsPage.CONSTANTS.LOCATION_LEICESTER_COUNTY_COURTROOM_07,
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
    // Test data
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: hmctsCaseNumber,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await createHearingSession(
      caseName,
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
      automaticBookingDashboardPage.CONSTANTS.REGION_MIDLANDS,
      automaticBookingDashboardPage.CONSTANTS.CLUSTER_LEICESTERSHIRE_RUTLAND,
      automaticBookingDashboardPage.CONSTANTS.LOCALITY_LEICESTER_COMBINED_COURT,
      automaticBookingDashboardPage.CONSTANTS.JURISDICTION_FAMILY,
      automaticBookingDashboardPage.CONSTANTS.DAILY_MIXED_CAUSE_LIST_SSRS,
      automaticBookingDashboardPage.CONSTANTS.VERSION_TYPE,
    );

    //assert that the report is generated and contains expected elements
    await automaticBookingDashboardPage.assertPreviewReport(
      dataUtils.getFormattedDateForReportAssertion(),
      automaticBookingDashboardPage.CONSTANTS.CIVIL_AND_FAMILY_DAILY_CAUSE_LIST,
      automaticBookingDashboardPage.CONSTANTS.LOCATION_LEICESTER_COUNTY_COURTROOM_07,
    );
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
