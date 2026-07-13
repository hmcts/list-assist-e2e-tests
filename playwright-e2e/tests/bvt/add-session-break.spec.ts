import { test, expect } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import { clearDownScheduleFromSessionSummary } from "../../utils/cleardown.utils.ts";

test.describe("Session Booking - add session break @session-break @bvt", () => {
  test("Create session and click Add Break", async ({
    page,
    loginPage,
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
    newUiSessionBookingPage,
  }) => {
    await test.step("Go to the base URL and log in as automation test user", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login();
    });

    await test.step("Clear existing session", async () => {
      await clearDownScheduleFromSessionSummary(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    });

    await test.step("Create new session", async () => {
      await newUiSessionBookingPage.createSessionWithoutBasketedCase(
        loginPage,
        hearingSchedulePage,
        sessionBookingPage,
        dataUtils,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04,
        0,
        0,
      );
    });

    await test.step("On session booking screen click Add break", async () => {
      await expect(sessionBookingPage.addBreakButton).toBeVisible();
      await sessionBookingPage.addBreakButton.click();
      // await sessionBookingPage.selectSessionBreakTimes("12:00", "13:00");
      // await sessionBookingPage.clickBookSelectedBreak();
    });

    await test.step.skip("Assert session break is added in Breaks table", async () => {
      //await sessionBookingPage.assertBreakRowVisible("12:00", "13:00");
    });
  });
});
