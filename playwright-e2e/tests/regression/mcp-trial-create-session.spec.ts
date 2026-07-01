import { test, expect } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";

test.describe("MCP Trial - Create Session via Hearing Schedule @mcp-trial", () => {
  test("Open Hearing Schedule, apply Merthyr Tydfil filters and create a session @mcp-trial", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    dataUtils,
  }) => {
    await test.step("Open default URL and log in as ROBERT_SULLIVAN", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login("ROBERT_SULLIVAN");
    });

    await test.step("Navigate to Hearing Schedule via sidebar", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
    });

    await test.step("Open Advanced Filters, clear and select Locality", async () => {
      await sessionBookingPage.advancedFiltersButton.click();
      await expect(sessionBookingPage.advancedFiltersHeader).toBeVisible();
      await sessionBookingPage.clearAdvanceFilterButton.click();

      await sessionBookingPage.localityDropDown.click();
      await page
        .getByRole("option", {
          name: sessionBookingPage.CONSTANTS
            .CASE_LISTING_LOCALITY_MERTHYR_TYDFIL_CC,
        })
        .locator("span")
        .nth(2)
        .click();
    });

    await test.step("Select Location: Merthyr Tydfil Courtroom 01 (Mags)", async () => {
      await sessionBookingPage.locationDropDown.click();
      await page
        .getByRole("option", {
          name: sessionBookingPage.CONSTANTS
            .CASE_LISTING_LOCATION_MERTHYR_TYDFIL_CRTRM_01_MAGS,
        })
        .locator("span")
        .nth(2)
        .click();
      await sessionBookingPage.locationFilterToggleButton.click();
    });

    await test.step("Apply advanced filters", async () => {
      await sessionBookingPage.applyButton.click();
      await hearingSchedulePage.waitForLoad();
    });

    await test.step("Set Start Date and End Date to today", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      const today = dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0);
      await hearingSchedulePage.applyPrimaryDateFilter(today, today);
    });

    await test.step("Click empty cell under current date in Rooms table and create session", async () => {
      await hearingSchedulePage.tabList
        .getByRole("tab", { name: hearingSchedulePage.tabNameRooms })
        .click();
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.addBookingButton.click();
      await hearingSchedulePage.schedulePopup.createSession.click();
    });
  });
});
