import { report } from 'process';
import { expect, test } from '../fixtures';
import { HomePage, CaseSearchPage, CaseDetailsPage, HearingSchedulePage } from '../page-objects/pages';
import { AddNewCasePage } from '../page-objects/pages/cases/add-new-case.po';
import { SessionBookingPage } from '../page-objects/pages/hearings/session-booking.po';
import { config } from '../utils';
import { DataUtils } from '../utils/data.utils';

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe('Case listing @case-listing', () => {
  test.beforeEach(async ({ page, homePage, hearingSchedulePage, sessionBookingPage }) => {
    await page.goto(config.urls.baseUrl);
    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();
    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
    );
    await homePage.sidebarComponent.openAddNewCasePage();
  });

  // test("Confirm case listing has status 'Released' @smoke", async ({
  //   sessionBookingPage,
  //   addNewCasePage,
  //   caseSearchPage,
  //   caseDetailsPage,
  //   hearingSchedulePage,
  //   homePage,
  // }) => {
  //   const hmctsCaseNumber = 'HMCTS_CN_' + addNewCasePage.hmctsCaseNumber;
  //   const caseName = 'AUTO_' + addNewCasePage.hmctsCaseNumber;

  //   // Test data
  //   const caseData = {
  //     hmctsCaseNumberHeaderValue: addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
  //     caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
  //     jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
  //     service: addNewCasePage.CONSTANTS.SERVICE_DIVORCE,
  //     caseType: addNewCasePage.CONSTANTS.DECREE_ABSOLUTE_CASE_TYPE,
  //     region: addNewCasePage.CONSTANTS.REGION_WALES,
  //     cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
  //     hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
  //     hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
  //     currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
  //   };

  //   // Test data
  //   const roomData = {
  //     roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
  //     column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
  //     caseNumber: hmctsCaseNumber,
  //     sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
  //     hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
  //     cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
  //   };

  //   await createHearingSession(
  //     addNewCasePage,
  //     caseData,
  //     hmctsCaseNumber,
  //     caseName,
  //     homePage,
  //     caseSearchPage,
  //     caseDetailsPage,
  //     hearingSchedulePage,
  //     roomData,
  //     sessionBookingPage,
  //   );
  // });

  test('Generate report via reports menu @smoke', async ({
    sessionBookingPage,
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
  }) => {
    const hmctsCaseNumber = 'HMCTS_CN_' + addNewCasePage.hmctsCaseNumber;
    const caseName = 'AUTO_' + addNewCasePage.hmctsCaseNumber;

    // Test data
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
      addNewCasePage,
      caseData,
      hmctsCaseNumber,
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
      dateFrom: dataUtils.getTodaysDayAsDd(),
      dateTo: dataUtils.getTodaysDayAsDd(),
      locality: 'Leicester Combined Court',
      location: 'Leicester County Courtroom 07',
      jurisdiction: 'Family',
      service: 'Divorce',
    };

    //open reports menu
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
});

async function createHearingSession(
  addNewCasePage: AddNewCasePage,
  caseData: {
    hmctsCaseNumberHeaderValue: string;
    caseNameHeaderValue: string;
    jurisdiction: string;
    service: string;
    caseType: string;
    region: string;
    cluster: string;
    hearingCentre: string;
    hearingTypeRef: string;
    currentStatus: string;
  },
  hmctsCaseNumber: string,
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
  await addNewCasePage.addNewCaseWithMandatoryData(caseData, hmctsCaseNumber, caseName);

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
