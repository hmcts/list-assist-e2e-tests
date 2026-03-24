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

test.describe("JOH filtering in hearing sessions with Rooms View", () => {
  test.afterEach(
    async ({ page, sessionBookingPage, hearingSchedulePage, dataUtils }) => {
      await page.goto(config.urls.baseUrl);
      await clearDownWrexhamSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        dataUtils,
      );
    },
  );

  test("Filter and display JOHs correctly using inclusion and exclusion criteria @joh-filtering", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
  }) => {
    await test.step("Login and clear down Wrexham schedule", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
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
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH AutomationTest",
      );
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH-Two AutomationTest",
      );
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

      await expect(hearingSchedulePage.table).toContainText(
        "JOH-Two AutomationTest",
      );
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH AutomationTest",
      );
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
      await expect(hearingSchedulePage.table).toContainText(
        "JOH AutomationTest",
      );
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH-Two AutomationTest",
      );
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
      await expect(hearingSchedulePage.table).toContainText(
        "JOH AutomationTest",
      );
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH-Two AutomationTest",
      );
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
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH AutomationTest",
      );
      await expect(hearingSchedulePage.table).toContainText(
        "JOH-Two AutomationTest",
      );
    });
  });

  test("Filter and display JOH correctly using tier inclusion @joh-filtering", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
  }) => {
    await test.step("Login and clear down Wrexham schedule", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
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
      await expect(hearingSchedulePage.table).toContainText(
        "JOH AutomationTest",
      );
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH-Two AutomationTest",
      );
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
      await expect(hearingSchedulePage.table).not.toContainText(
        "JOH AutomationTest",
      );
      await expect(hearingSchedulePage.table).toContainText(
        "JOH-Two AutomationTest",
      );
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
      await expect(hearingSchedulePage.table).toContainText(
        "JOH AutomationTest",
      );
      await expect(hearingSchedulePage.table).toContainText(
        "JOH-Two AutomationTest",
      );
    });
  });

  test("Filter and display JOH exclusion filter correctly using tier exclusion @joh-filtering @this", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
  }) => {
    await test.step("Login and clear down Wrexham schedule", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);

      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await hearingSchedulePage.waitForLoad();
      

      await openAdvFiltersAndSelectLocalityAndLocation(
        page,
        sessionBookingPage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      );

      await page.getByRole("button", { name: "Who", exact: true }).click();

      await hearingSchedulePage.johTierExclusionFilter.click();
      await page
        .getByRole("textbox", { name: "JOH Tier (Exclusion)" })
        .fill("District Judge");
      await page
        .locator('li[id^="advancedFilter_employeeWorkTypeEx_option_"]')
        .getByText("District Judge", { exact: true })
        .click();
      await page.locator(
  'span[role="button"][aria-label="Close listbox"].multiselect__custom-select'
).click();

      await test.step("Verify 'AutomationTest, JOH' is present in JOH Exclusion LOV", async () => {
  await hearingSchedulePage.johExclusionFilter.click();
  const options = await page
    .locator('ul#advancedFilter_memTypeEx_listbox li[role="option"] .multiselect__options-item')
    .allTextContents();

  // Trim whitespace from each option
  const trimmedOptions = options.map(opt => opt.trim());

  expect(trimmedOptions).toContain("AutomationTest, JOH");
});

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

  function applyPrimaryDateFilterForSameDay(
    hearingSchedulePage,
    dataUtils,
    offset: number,
  ) {
    const today = new Date();
    const adjustedOffset = today.getDay() === 5 ? offset + 3 : offset;
    return hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
    );
  }

  function applyPrimaryDateFilterForDifferentDays(
    hearingSchedulePage,
    dataUtils,
    fromOffset: number,
    toOffset: number,
  ) {
    const today = new Date();
    const offset = today.getDay() === 5 ? 3 : 0;
    return hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(fromOffset + offset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(toOffset + offset),
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
    const today = new Date();
    // If Friday, add 3 to the base offset, otherwise use base offset
    const dateOffset = today.getDay() === 5 ? baseOffset + 3 : baseOffset;

    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();

    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(dateOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(dateOffset),
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
});
