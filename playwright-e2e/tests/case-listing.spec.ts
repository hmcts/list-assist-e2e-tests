import { expect, test } from "../fixtures";
import { config } from "../utils";
import { TestData } from "../test-data.ts";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Listing a case @listing-a-case", () => {
  test.beforeEach(async ({ page, homePage, listACase }) => {
    await page.goto(config.urls.baseUrl);
    await homePage.sidebarComponent.openAddNewCasePage();
    await listACase.emptyCaseCart();
  });

  test("Confirm case listing @smoke", async ({
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
    listACase,
    hearingSchedulePage
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
      roomName: "Leicester County Courtroom 07",
      column: "columnOne",
      caseNumber: hmctsCaseNumber,
      sessionDuration: "1:00",
      hearingType: "Application",
      cancelReason: "Amend",
    };

    await addNewCasePage.addNewCaseWithMandatoryData(
      caseData,
      hmctsCaseNumber,
      caseName
    );

    //add case to cart
    await listACase.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(caseName);
    await caseDetailsPage.addToCartButton.click();
    await expect(listACase.cartButton).toBeEnabled();

    //go to hearing schedule page
    await expect(hearingSchedulePage.sidebarComponent.sidebar).toBeVisible();
    await listACase.sidebarComponent.openHearingSchedulePage();

    //schedule hearing
    await hearingSchedulePage.waitForLoad();
    await hearingSchedulePage.scheduleHearingWithBasket(
      roomData.roomName,
      roomData.column,
      roomData.caseNumber,
    );

    //session booking page
    await expect(listACase.sessionBookingHeader).toBeVisible();

  });
});
