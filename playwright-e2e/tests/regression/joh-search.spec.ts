import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";
import { clearDownSchedule } from "../../utils/reporting.utils.js";

test.describe("JOH filtering in hearing sessions", () => {
  test.describe.configure({ mode: "serial" });
});

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

test("should filter and display JOHs correctly using inclusion and exclusion criteria @joh-filtering", async ({
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

  await test.step("Add case to cart and open hearing schedule", async () => {
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();
  });

  await test.step("Apply primary date filter and select locality/location", async () => {
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );
    await openAdvFiltersAndSelectLocalityAndLocation(
      page,
      sessionBookingPage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
    );
    await sessionBookingPage.applyButton.click();
    await hearingSchedulePage.waitForLoad();
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();
  });

  await test.step("Book session with JOH AutomationTest", async () => {
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();
    await hearingSchedulePage.scheduleHearingWithBasket(
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      process.env.CASE_NAME as string,
    );
    await sessionBookingPage.bookSession(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
      sessionBookingPage.CONSTANTS.AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH,
      sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_FAMILY_CODE_AB,
    );
  });

  await test.step("Book session with JOH-Two AutomationTest", async () => {
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();
    await reloadHearingSchedulePage(
      page,
      hearingSchedulePage,
      sessionBookingPage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
    );
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
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
      sessionBookingPage.CONSTANTS
        .AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH_TWO,
      sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_CIVIL_CODE_CIV,
    );
  });

  await test.step("Assert filtering by date range, current date +2 (no JOHs expected)", async () => {
    await reloadHearingSchedulePage(
      page,
      hearingSchedulePage,
      sessionBookingPage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
    );
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(2),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(2),
    );
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
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
    );
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
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
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
    await expect(hearingSchedulePage.table).toContainText("JOH AutomationTest");
    await expect(hearingSchedulePage.table).not.toContainText(
      "JOH-Two AutomationTest",
    );
  });

  await test.step("Apply JOH inclusion filter", async () => {
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
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
    await expect(hearingSchedulePage.table).toContainText("JOH AutomationTest");
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
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
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
