import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";
import { clearDownSchedule } from "../../utils/reporting.utils.js";

test.describe.configure({ mode: "serial" });

/**
 * NOTE:
 * - Tests rely on sessions being available for today and today + 1.
 * - If run on a Friday, tests must look for sessions on today + 3 and + 4 (to skip the weekend).
 * - Use applyPrimaryDateFilterForSameDay for single-date filtering.
 * - Use applyPrimaryDateFilterForDifferentDays for date range filtering.
 * - If this logic is not followed, tests may fail due to no sessions being available on weekends.
 */

test.describe("JOH filtering in hearing sessions with Rooms View @joh-filtering", () => {
  test.beforeEach(async ({ page }) => {
    // Add page crash and error detection handlers
    page.on("close", () => {
      console.log("WARNING: Page was closed unexpectedly during test");
    });

    page.on("pageerror", (err: Error) => {
      console.error("Page error detected:", err.message);
    });
  });

  test.afterEach(
    async ({ page, sessionBookingPage, hearingSchedulePage, dataUtils }) => {
      try {
        // Check if page is still valid before using it
        if (!page.isClosed()) {
          try {
            await page.goto(config.urls.baseUrl, {
              waitUntil: "load",
              timeout: 10000,
            });
            await clearDownWrexhamSchedule(
              sessionBookingPage,
              hearingSchedulePage,
              dataUtils,
            );
          } catch (navigationError) {
            const errorMessage =
              navigationError instanceof Error
                ? navigationError.message
                : String(navigationError);
            console.error(
              "Navigation or cleanup failed during afterEach:",
              errorMessage,
            );
            // Don't fail the test if cleanup fails
          }
        } else {
          console.log("Page was already closed, skipping afterEach cleanup");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Unexpected error in afterEach:", errorMessage);
      }
    },
  );

  test("Filter and display JOHs correctly using inclusion and exclusion criteria @this", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
  }) => {
    await test.step("Login and clear down Wrexham schedule", async () => {
      await page.goto(config.urls.baseUrl, {
        waitUntil: "load",
        timeout: 15000,
      });
      await loginPage.login(config.users.testUser);
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {
        console.log("Load state timeout, proceeding anyway");
      });
      await clearDownWrexhamSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        dataUtils,
      );
    });

    await bookSessionWithJoh(
      page,
      sessionBookingPage,
      hearingSchedulePage,
      caseSearchPage,
      caseDetailsPage,
      dataUtils,
      "JOH AutomationTest",
      sessionBookingPage.CONSTANTS.AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH,
      sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_FAMILY_CODE_AB,
      0,
    );

    await bookSessionWithJoh(
      page,
      sessionBookingPage,
      hearingSchedulePage,
      caseSearchPage,
      caseDetailsPage,
      dataUtils,
      "JOH-Two AutomationTest",
      sessionBookingPage.CONSTANTS
        .AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH_TWO,
      sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_CIVIL_CODE_CIV,
      1,
    );

    await test.step("Assert filtering by date range, current date +2 (no JOHs expected)", async () => {
      await reloadHearingSchedulePage(
        page,
        hearingSchedulePage,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );
      await applyPrimaryDateFilterForSameDay(hearingSchedulePage, dataUtils, 2);

      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await hearingSchedulePage.waitForLoad();
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH-Two AutomationTest");
    });

    await test.step("Assert filtering by date range, current date + 1 (JOH-Two AutomationTest expected)", async () => {
      await reloadHearingSchedulePage(
        page,
        hearingSchedulePage,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );

      await applyPrimaryDateFilterForSameDay(hearingSchedulePage, dataUtils, 1);

      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH-Two AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH AutomationTest");
    });

    await test.step("Apply jurisdiction filter and assert JOH AutomationTest/Family session present", async () => {
      await reloadHearingSchedulePage(
        page,
        hearingSchedulePage,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );

      await applyPrimaryDateFilterForDifferentDays(
        hearingSchedulePage,
        dataUtils,
        0,
        1,
      );

      await sessionBookingPage.advancedFiltersButton.click();
      await expect(sessionBookingPage.advancedFiltersHeader).toBeVisible();
      await page.getByRole("button", { name: "Session", exact: true }).click();
      await hearingSchedulePage.advJurisdictionFilter.click();
      await expect
        .poll(
          async () => {
            try {
              await page
                .locator("#advancedFilter_jurisdictionTypes_option_4")
                .getByText("Family", { exact: true })
                .click();
              return true;
            } catch {
              return false;
            }
          },
          { timeout: 10000, intervals: [1000] },
        )
        .toBe(true);
      await sessionBookingPage.applyButton.click();
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await hearingSchedulePage.waitForLoad();
      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH-Two AutomationTest");
    });

    await test.step("Apply JOH inclusion filter", async () => {
      await applyPrimaryDateFilterForDifferentDays(
        hearingSchedulePage,
        dataUtils,
        0,
        1,
      );

      await reloadHearingSchedulePage(
        page,
        hearingSchedulePage,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );
      await openAdvFiltersAndSelectLocalityAndLocation(
        page,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );
      await page.getByRole("button", { name: "Who", exact: true }).click();
      await hearingSchedulePage.johInclusionFilter.click();
      await page
        .getByRole("textbox", { name: "JOH (Inclusion)" })
        .fill("automationtest");
      await page
        .locator("#advancedFilter_memTypesIn_option_1")
        .getByText("AutomationTest, JOH")
        .click();
      await sessionBookingPage.applyButton.click();
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await hearingSchedulePage.waitForLoad();
      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH-Two AutomationTest");
    });

    await test.step("Apply JOH exclusion filter", async () => {
      await reloadHearingSchedulePage(
        page,
        hearingSchedulePage,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );

      await applyPrimaryDateFilterForDifferentDays(
        hearingSchedulePage,
        dataUtils,
        0,
        1,
      );

      await openAdvFiltersAndSelectLocalityAndLocation(
        page,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );
      await page.getByRole("button", { name: "Who", exact: true }).click();
      await hearingSchedulePage.johExclusionFilter.click();
      await page
        .getByRole("textbox", { name: "JOH (Exclusion)" })
        .fill("automationtest");
      await page
        .locator("#advancedFilter_memTypeEx_option_1")
        .getByText("AutomationTest, JOH")
        .click();
      await sessionBookingPage.applyButton.click();
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await hearingSchedulePage.waitForLoad();
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH-Two AutomationTest");
    });
  });

  test("Filter and display JOH correctly using tier inclusion", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
  }) => {
    await test.step("Login and clear down Wrexham schedule", async () => {
      await page.goto(config.urls.baseUrl, {
        waitUntil: "load",
        timeout: 15000,
      });
      await loginPage.login(config.users.testUser);
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {
        console.log("Load state timeout, proceeding anyway");
      });
      await clearDownWrexhamSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        dataUtils,
      );
    });

    await bookSessionWithJoh(
      page,
      sessionBookingPage,
      hearingSchedulePage,
      caseSearchPage,
      caseDetailsPage,
      dataUtils,
      "JOH AutomationTest",
      sessionBookingPage.CONSTANTS.AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH,
      sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_FAMILY_CODE_AB,
      0,
    );

    await bookSessionWithJoh(
      page,
      sessionBookingPage,
      hearingSchedulePage,
      caseSearchPage,
      caseDetailsPage,
      dataUtils,
      "JOH-Two AutomationTest",
      sessionBookingPage.CONSTANTS
        .AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH_TWO,
      sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_CIVIL_CODE_CIV,
      1,
    );

    await test.step("Reload hearing schedule and apply date filter for different days", async () => {
      await reloadHearingSchedulePage(
        page,
        hearingSchedulePage,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );

      await applyPrimaryDateFilterForDifferentDays(
        hearingSchedulePage,
        dataUtils,
        0,
        1,
      );
    });

    await test.step("Apply tier inclusion filter for District Judge and assert results", async () => {
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.clearAllPrimaryFilters();
      await hearingSchedulePage.primaryFilterSelectLocality(
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      );
      await hearingSchedulePage.johTierInclusionToggleButton.click();
      await hearingSchedulePage.johTierInclusionTextbox.fill("District Judge");
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage
        .getJohTierInclusionOption("District Judge")
        .click();
      await hearingSchedulePage.primaryFilterApplyButton.click();
      await hearingSchedulePage.waitForLoad();
      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH-Two AutomationTest");
    });

    await test.step("Apply tier inclusion filter for Employment Judge and assert results", async () => {
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.clearAllPrimaryFilters();
      await hearingSchedulePage.primaryFilterSelectLocality(
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      );
      await hearingSchedulePage.johTierInclusionToggleButton.click();
      await hearingSchedulePage.johTierInclusionTextbox.fill(
        "Employment Judge",
      );
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage
        .getJohTierInclusionOption("Employment Judge")
        .click();
      await hearingSchedulePage.primaryFilterApplyButton.click();
      await hearingSchedulePage.waitForLoad();
      await expect
        .soft(hearingSchedulePage.table)
        .not.toContainText("JOH AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH-Two AutomationTest");
    });

    await test.step("Apply tier inclusion filter for District Judge and Employment Judge and assert results", async () => {
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.clearAllPrimaryFilters();
      await hearingSchedulePage.primaryFilterSelectLocality(
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      );
      await hearingSchedulePage.johTierInclusionToggleButton.click();
      await hearingSchedulePage.johTierInclusionTextbox.fill("District Judge");
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage
        .getJohTierInclusionOption("District Judge")
        .click();
      await hearingSchedulePage.johTierInclusionTextbox.fill(
        "Employment Judge",
      );
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage
        .getJohTierInclusionOption("Employment Judge")
        .click();
      await hearingSchedulePage.primaryFilterApplyButton.click();
      await hearingSchedulePage.waitForLoad();
      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH AutomationTest");
      await expect
        .soft(hearingSchedulePage.table)
        .toContainText("JOH-Two AutomationTest");
    });
  });

  async function clearDownWrexhamSchedule(
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
  ) {
    await clearDownSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );

    //need to check if test is being run on a Friday.
    //if run on a Friday, schedule needs to be checked for the following Monday.
    const today = new Date();
    if (today.getDay() === 5) {
      // Friday
      await clearDownSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(3),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(3),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(3),
      );
    } else {
      await clearDownSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(1),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
      );
    }
  }

  async function reloadHearingSchedulePage(
    page,
    hearingSchedulePage,
    sessionBookingPage,
    locality,
    location,
  ) {
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();

    await sessionBookingPage.advancedFiltersButton.click();
    await expect(sessionBookingPage.advancedFiltersHeader).toBeVisible();
    //ensure the advanced filter is cleared
    await sessionBookingPage.clearAdvanceFilterButton.click();

    //select a single locality
    await sessionBookingPage.localityDropDown.click();
    await page
      .getByRole("option", {
        name: locality,
        exact: true,
      })
      .locator("span")
      .nth(2)
      .click();

    //location dropdown and location selection
    await sessionBookingPage.locationDropDown.click();
    await page
      .getByRole("option", {
        name: location,
        exact: true,
      })
      .locator("span")
      .nth(2)
      .click();
    // Use the class property here
    await sessionBookingPage.locationFilterToggleButton.click();

    //apply filter
    await sessionBookingPage.applyButton.click();

    //schedule hearing
    await hearingSchedulePage.waitForLoad();

    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();
  }

  async function openAdvFiltersAndSelectLocalityAndLocation(
    page,
    sessionBookingPage,
    locality,
    location,
  ) {
    await sessionBookingPage.advancedFiltersButton.click();
    await expect(sessionBookingPage.advancedFiltersHeader).toBeVisible();
    await sessionBookingPage.clearAdvanceFilterButton.click();

    // Select a single locality
    await sessionBookingPage.localityDropDown.click();
    await page
      .getByRole("option", {
        name: locality,
        exact: true,
      })
      .locator("span")
      .nth(2)
      .click();

    // Location dropdown and location selection
    await sessionBookingPage.locationDropDown.click();
    await page
      .getByRole("option", {
        name: location,
        exact: true,
      })
      .locator("span")
      .nth(2)
      .click();
    await sessionBookingPage.locationFilterToggleButton.click();
  }

  async function applyPrimaryDateFilterForSameDay(
    hearingSchedulePage,
    dataUtils,
    offset: number,
  ) {
    const adjustedOffset = await getAdjustedOffset(offset);

    return hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
    );
  }

  async function applyPrimaryDateFilterForDifferentDays(
    hearingSchedulePage,
    dataUtils,
    fromOffset: number,
    toOffset: number,
  ) {
    const adjustedFrom = await getAdjustedOffset(fromOffset);
    const adjustedTo = await getAdjustedOffset(toOffset);

    return hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedFrom),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedTo),
    );
  }

  /**
   * Books a session with a specified JOH and jurisdiction.
   */
  async function bookSessionWithJoh(
    page,
    sessionBookingPage,
    hearingSchedulePage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
    johName: string,
    johConstant: string,
    jurisdictionConstant: string,
    baseOffset: number,
  ) {
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();

    const adjustedOffset = await getAdjustedOffset(baseOffset);
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
    );

    await hearingSchedulePage.waitForLoad();

    await hearingSchedulePage.scheduleHearingWithBasket(
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      process.env.CASE_NAME as string,
    );
    await sessionBookingPage.bookSession(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
      johConstant,
      jurisdictionConstant,
    );
  }
  async function getAdjustedOffset(offset: number): Promise<number> {
    const today = new Date();

    if (offset === 0) {
      return 0;
    }
    if (today.getDay() === 5) {
      // Friday
      if (offset === 1) {
        return 3;
      }
      if (offset > 1) {
        return offset + 3;
      }
    }
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);
    const day = targetDate.getDay();
    if (day === 6) {
      return offset + 2; // Saturday → Monday
    }
    if (day === 0) {
      return offset + 1; // Sunday → Monday
    }
    return offset;
  }
});
