import { expect, test } from "../fixtures";
import { config } from "../utils";
import { TestData } from "../test-data.ts";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Case listing @case-listing", () => {

  test.beforeEach(async ({ page, homePage, caseListingPage, hearingSchedulePage }) => {
    await page.goto(config.urls.baseUrl);
    //empties cart if there is anything present
    await caseListingPage.emptyCaseCart();
    await hearingSchedulePage.clearDownSchedule(TestData.SESSION_DETAILS_CANCELLATION_CODE_CANCEL);
    await homePage.sidebarComponent.openAddNewCasePage();
  });

  test("Confirm case listing @smoke", async ({
    bookSessionPage,
                                               addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
    caseListingPage,
    hearingSchedulePage,
  }) => {
    const hmctsCaseNumber = "HMCTS_CN_" + addNewCasePage.hmctsCaseNumber;
    const caseName = "AUTO_" + addNewCasePage.hmctsCaseNumber;

    // Test data
    const caseData = {
      hmctsCaseNumberHeaderValue: TestData.HMCTS_CASE_NUMBER_HEADER_VALUE,
      caseNameHeaderValue: TestData.CASE_NAME_HEADER_VALUE,
      jurisdiction: TestData.JURISDICTION_FAMILY,
      service: TestData.SERVICE_DIVORCE,
      caseType: TestData.DECREE_ABSOLUTE_CASE_TYPE,
      region: TestData.REGION_WALES,
      cluster: TestData.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      hearingCentre: TestData.HEARING_CENTRE_CARDIFF,
      hearingTypeRef: TestData.HEARING_TYPE_APPLICATION_REF,
      currentStatus: TestData.CURRENT_STATUS_AWAITING_LISTING,
    };

    // Test data
    const roomData = {
      roomName: TestData.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
      column: TestData.CASE_LISTING_COLUMN_ONE,
      caseNumber: hmctsCaseNumber,
      sessionDuration: TestData.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: TestData.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: TestData.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await addNewCasePage.addNewCaseWithMandatoryData(
      caseData,
      hmctsCaseNumber,
      caseName,
    );

    //add case to cart
    await caseListingPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(caseName);
    await caseDetailsPage.addToCartButton.click();
    await expect(caseListingPage.cartButton).toBeEnabled();

    //go to hearing schedule page
    await expect(hearingSchedulePage.sidebarComponent.sidebar).toBeVisible();
    await caseListingPage.sidebarComponent.openHearingSchedulePage();

    //schedule hearing
    await hearingSchedulePage.waitForLoad();

    await hearingSchedulePage.scheduleHearingWithBasket(
      roomData.roomName,
      roomData.column,
      roomData.caseNumber,
    );

    //session booking page
    await expect(caseListingPage.sessionBookingHeader).toBeVisible();
    await caseListingPage.sessionStatusDropdown.click();
    await caseListingPage.sessionStatusDropdown.selectOption(
      TestData.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
    );
    await caseListingPage.durationDropdown.selectOption(
      TestData.CASE_LISTING_SESSION_DURATION_1_00,
    );
    await caseListingPage.saveButton.click();

    //Check Listing iframe
    await caseListingPage.checkingListingIframe();

    //confirm listing
    await expect(caseListingPage.bookingDetailsButtons).toContainText(
      "Released",
    );
  });
});
