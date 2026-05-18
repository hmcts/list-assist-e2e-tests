import { test, expect } from "../../fixtures";
import { config } from "../../utils";
import { clearDownSchedule } from "../../utils/reporting.utils";

test.describe("Hearing Schedule - drag and drop @drag-and-drop", () => {
  test("Basic drag and drop", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    homePage,
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
  }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login();

    // Clear down schedule for today and next working day
    const adjustedOffset = await dataUtils.getAdjustedOffset(1);
    await clearDownSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARMARTHEN_CC_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );
    await clearDownSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARMARTHEN_CC_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
    );

    // Empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    // Add a new case
    await addNewCasePage.addNewCase(homePage, hearingSchedulePage);

    // Search for case
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

    // Add case to cart
    await caseDetailsPage.addToCartButton.click();
    await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();

    // Navigate to Hearing Schedule via sidebar
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();

    // Assert that the Hearing Schedule page has loaded
    await expect(hearingSchedulePage.header).toBeVisible();

    // Open Advanced Filters, clear pre-populated filters, set Locality and Location
    await sessionBookingPage.updateAdvancedFilterConfig(
      undefined,
      undefined,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARMARTHEN_CC_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
    );

    // Apply primary date filter for next working day (today + 1, skipping weekends)
    await hearingSchedulePage.primaryFilterToggleButton.click();
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
    );

    // Wait for the schedule to load after filtering
    await hearingSchedulePage.waitForLoad();

    // Schedule hearing with basket in columnTwo
    await hearingSchedulePage.scheduleHearingWithBasket(
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
      sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      process.env.HMCTS_CASE_NUMBER as string,
    );

    // Book the session
    await sessionBookingPage.bookSession(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
    );

    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );

    // Wait for the schedule to load after filtering
    await hearingSchedulePage.waitForLoad();

    //click on empty cell, and create session with no case in basket
    await hearingSchedulePage.page.locator("#roomHS").click();
    await hearingSchedulePage.waitForLoad();
    const table = await hearingSchedulePage.mapTable();
    const row = table.filter(
      (r) =>
        r.roomName ===
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
    )[0];
    await row[sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE]
      .locator(hearingSchedulePage.scheduleSelector)
      .click();
    await expect(hearingSchedulePage.schedulePopup.createSession).toBeVisible();
    await hearingSchedulePage.schedulePopup.createSession.click();

    // Wait for session booking page to load
    await sessionBookingPage.waitForLoad();

    // Select 'Family' jurisdiction
    await sessionBookingPage.jurisdictionDropdown.selectOption({
      value:
        sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_FAMILY_CODE_AB,
    });

    // Select 1:00 default listing duration
    await sessionBookingPage.durationDropdownButton.click();
    await sessionBookingPage.selectListingDuration(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
    );

    // Click Save
    await sessionBookingPage.saveButton.click();

    // Wait for hearing schedule to reload
    await hearingSchedulePage.waitForLoad();

    // Apply date filter spanning today through next working day
    // await hearingSchedulePage.primaryFilterToggleButton.click();
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );

    // Switch to Rooms view
    await hearingSchedulePage.page.locator("#roomHS").click();
    await hearingSchedulePage.waitForLoad();

    // Verify both today and next working day columns show Released for Carmarthen room
    const verifyTable = await hearingSchedulePage.mapTable();
    const carmarthenRow = verifyTable.filter(
      (r) =>
        r.roomName ===
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
    )[0];

    await expect(
      carmarthenRow[
        sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE
      ].locator('button[title="Show booking details"] .hs-session-status', {
        hasText: "Released",
      }),
    ).toBeVisible();

    await expect(
      carmarthenRow[
        sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_TWO
      ].locator('button[title="Show booking details"] .hs-session-status', {
        hasText: "Released",
      }),
    ).toBeVisible();
  });
});
