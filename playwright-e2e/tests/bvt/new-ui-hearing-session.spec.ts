import { test, expect } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import { clearDownScheduleFromSessionSummary } from "../../utils/reporting.utils.ts";

test.describe("New hearing session UI - check create session @new-ui @regression", () => {
  test.describe.configure({ mode: "serial" });

  test("Create session - ensure all UI elements are visible", async ({
    loginPage,
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
    newUiSessionBookingPage,
  }) => {
    await test.step("Open app, filter schedule, and open Create Session. UI Validation", async () => {
      await newUiSessionBookingPage.createSessionWithoutBasketedCase(
        loginPage,
        hearingSchedulePage,
        sessionBookingPage,
        dataUtils,
        "ROBERT_SULLIVAN",
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
        0,
        0,
      );
      await newUiSessionBookingPage.assertSessionBookingDetailsUiElementsVisible();
    });
  });

  test("List session with basketed case using new UI", async ({
    page,
    loginPage,
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
    addNewCasePage,
    homePage,
    caseSearchPage,
    caseDetailsPage,
    newUiSessionBookingPage,
  }) => {
    await test.step("Open app and login as AUTO_ROBERT_SULLIVAN", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login("ROBERT_SULLIVAN");
    });

    await test.step("Clean down schedule for Haverfordwest County and Family, Haverfordwest Courtroom 1", async () => {
      await clearDownScheduleFromSessionSummary(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    });

    await test.step("Add a case with default arguments and add it to basket", async () => {
      await addNewCasePage.addNewCase(homePage, hearingSchedulePage);
      await caseDetailsPage.addToCartButton.click();
      await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();
    });

    await test.step("Open hearing schedule and set advanced filters", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await sessionBookingPage.updateAdvancedFilterConfig(
        undefined,
        undefined,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
      );
    });

    await test.step("Apply today's date filter", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await hearingSchedulePage.applyPrimaryDateFilter(
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    });

    await test.step("Schedule hearing with basketed case", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await hearingSchedulePage.scheduleHearingWithBasket(
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
        sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
        process.env.CASE_NAME as string,
      );
    });

    await test.step("Assert start date field is present and populated", async () => {
      await expect(
        newUiSessionBookingPage.editableStartTimeInput,
      ).toBeVisible();
      await expect(newUiSessionBookingPage.editableStartTimeInput).toHaveValue(
        /\d{2}-\d{2}-\d{4}/,
      );
    });

    await test.step("Assert start and end times are already populated", async () => {
      const startTime = "10:00";
      await newUiSessionBookingPage.assertStartTime(startTime);

      const endTime = "16:00";
      await newUiSessionBookingPage.assertEndTime(endTime);
    });

    await test.step("Assert locality and location are already populated", async () => {
      await newUiSessionBookingPage.assertLocality(
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
      );

      await newUiSessionBookingPage.assertLocation(
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
      );
    });

    await test.step("Assert session status is already populated", async () => {
      await newUiSessionBookingPage.assertSessionStatus(
        newUiSessionBookingPage.CONSTANTS.SESSION_STATUS_RELEASED,
      );
    });

    await test.step("Select session type as Adhoc (as directed) and confirm selection", async () => {
      await newUiSessionBookingPage.selectAndAssertSessionType(
        newUiSessionBookingPage.CONSTANTS.SESSION_TYPE_ADHOC_AS_DIRECTED,
      );
    });

    await test.step("Select default listing duration as 01:00 and confirm selection", async () => {
      await newUiSessionBookingPage.selectAndAssertDefaultListingDuration(
        newUiSessionBookingPage.CONSTANTS.DEFAULT_LISTING_DURATION_ONE_HOUR,
      );
    });

    await test.step("Fill internal comment with case name", async () => {
      await newUiSessionBookingPage.fillInternalComment(
        `${newUiSessionBookingPage.CONSTANTS.INTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
      );
    });

    await test.step("Fill external comment with case name", async () => {
      await newUiSessionBookingPage.fillExternalComment(
        `${newUiSessionBookingPage.CONSTANTS.EXTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
      );
    });

    await test.step("Click Add Panel Members button", async () => {
      await newUiSessionBookingPage.clickAddPanelMember();
    });

    await test.step("Search for panel member AMANDA_FOSTER", async () => {
      await newUiSessionBookingPage.searchPanelMember(
        newUiSessionBookingPage.CONSTANTS.PANEL_MEMBER_AMANDA_FOSTER,
      );
    });

    await test.step("Click Select & Save for the first panel member result", async () => {
      await newUiSessionBookingPage.clickSelectAndSaveFirstPanelMember();
    });

    await test.step("Dismiss no specialism confirmation popup if present", async () => {
      await newUiSessionBookingPage.dismissNoSpecialismConfirmationIfPresent();
    });

    await test.step("Click Save Session Booking button", async () => {
      await newUiSessionBookingPage.clickSaveSessionBooking();
    });

    await test.step("Select hearing type as Chambers Outcome in listing popup, and Save", async () => {
      await newUiSessionBookingPage.selectHearingTypeInListingPopup(
        newUiSessionBookingPage.CONSTANTS.HEARING_TYPE_CHAMBERS_OUTCOME,
      );
    });

    await test.step("Confirm listing has been created", async () => {
      await expect(
        hearingSchedulePage.confirmListingReleasedStatus,
      ).toBeVisible();
    });
  });
});
