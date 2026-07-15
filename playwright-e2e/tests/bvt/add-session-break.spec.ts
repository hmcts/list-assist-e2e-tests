import { test, expect } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import { clearDownScheduleFromSessionSummary } from "../../utils/cleardown.utils.ts";

test.describe("Session Booking - add session break @session-break @bvt", () => {

  test.afterEach(
      async ({ hearingSchedulePage,
               sessionBookingPage,
               dataUtils }) => {
        await hearingSchedulePage.deleteSessionWithoutListing(
            sessionBookingPage.CONSTANTS
                .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04,
            dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        );
      },
  );


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
      await loginPage.login("DAVID_HICKS");
          //await loginPage.login();

    
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

    await test.step("Assert 'Add Break' button is present", async () => {
      await expect(sessionBookingPage.addBreakButton).toBeVisible();
    });

    await test.step("Click 'Add Break' and assert popup headed 'Venue Booking Break' is present", async () => {
      const breakPopup = await sessionBookingPage.openBreakPopup();
      await expect(
        breakPopup.getByRole("heading", { name: "Venue Booking Break" }),
      ).toBeVisible();

      await test.step("Select Start Time '12:00' and End Time '13:00'", async () => {
        await sessionBookingPage.selectBreakStartTime(breakPopup, "12:00");
        await sessionBookingPage.selectBreakEndTime(breakPopup, "13:00");
      });

      await test.step("Click 'Book Selected'", async () => {
        await sessionBookingPage.clickBookSelected(breakPopup);
      });
    });

    await test.step("Assert break with Start Time 12:00 and End Time 13:00 is visible in Breaks section", async () => {
      await sessionBookingPage.assertBreakRowVisible("12:00", "13:00");
    });

    await test.step("Select Hearing Duration '1:00'", async () => {
      await sessionBookingPage.selectListingDuration(
        sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      );
    });

    await test.step("Click Save", async () => {
      await sessionBookingPage.saveButton.click();
      await hearingSchedulePage.waitForLoad();
    });


    await test.step("Assert that session break appear on Hearing Schedule", async () => {

   await expect(
  hearingSchedulePage.getSessionBreakLocator("12:00", "13:00"),
  ).toBeVisible();

 });

});
});
