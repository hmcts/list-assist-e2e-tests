import type { Locator, Page } from "@playwright/test";
import {
  regions,
  clusters,
  localities,
  locations,
} from "../../data/drop-down-data";
import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";
import { clearDownSchedule } from "../../utils/reporting.utils.js";

test.describe("JOH Search", () => {
  test.describe.configure({ mode: "serial" });
});

test("search for JOHs by a criteria @joh-search", async ({
  page,
  loginPage,
  hearingSchedulePage,
  sessionBookingPage,
  caseSearchPage,
  caseDetailsPage,
  dataUtils,
}) => {
  await page.goto(config.urls.baseUrl);
  await loginPage.login(config.users.testUser);

  await clearDownWrexhamSchedule(
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
  );

  //add case to cart
  await caseSearchPage.sidebarComponent.openSearchCasePage();
  await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

  await expect(caseDetailsPage.addToCartButton).toBeVisible();
  await caseDetailsPage.addToCartButton.click();
  await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

  await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
  await hearingSchedulePage.waitForLoad();

  await hearingSchedulePage.primaryFilterToggleButton.click();
  await hearingSchedulePage
    .primaryFilterDateInput(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    )
    .click();
  await hearingSchedulePage
    .primaryFilterDateInput(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    )
    .click();
  await hearingSchedulePage.applyPrimaryFilterButton.click();

  await sessionBookingPage.advancedFiltersButton.click();
  await expect(sessionBookingPage.advancedFiltersHeader).toBeVisible();
  //ensure the advanced filter is cleared
  await sessionBookingPage.clearAdvanceFilterButton.click();

  // //region dropdown
  // await assertAdvFilterDropdownOptions(sessionBookingPage.regionDropdown, regions, page);

  // //cluster dropdown
  // await assertAdvFilterDropdownOptions(sessionBookingPage.clusterDropDown, clusters, page);

  // //locality dropdown
  // await assertAdvFilterDropdownOptions(sessionBookingPage.localityDropDown, localities, page);

  // //location dropdown
  // await assertAdvFilterDropdownOptions(sessionBookingPage.locationDropDown, locations, page);

  //select a single locality
  await sessionBookingPage.localityDropDown.click();
  await page
    .getByRole("option", {
      name: sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      exact: true,
    })
    .locator("span")
    .nth(2)
    .click();

  //location dropdown and location selection
  await sessionBookingPage.locationDropDown.click();
  await page
    .getByRole("option", {
      name: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
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

  await hearingSchedulePage.primaryFilterToggleButton.click();
  await hearingSchedulePage.primaryFilterFromDateInput.click();
  await hearingSchedulePage
    .primaryFilterDateInput(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    )
    .click();
  await hearingSchedulePage
    .primaryFilterDateInput(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    )
    .click();
  await hearingSchedulePage.applyPrimaryFilterButton.click();

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

  //add case to cart
  await caseSearchPage.sidebarComponent.openSearchCasePage();
  await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

  await expect(caseDetailsPage.addToCartButton).toBeVisible();
  await caseDetailsPage.addToCartButton.click();
  await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

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
      name: sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      exact: true,
    })
    .locator("span")
    .nth(2)
    .click();

  //location dropdown and location selection
  await sessionBookingPage.locationDropDown.click();
  await page
    .getByRole("option", {
      name: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
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

  await hearingSchedulePage.primaryFilterToggleButton.click();
  await hearingSchedulePage.primaryFilterFromDateInput.click();
  await hearingSchedulePage
    .primaryFilterDateInput(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
    )
    .click();
  await hearingSchedulePage
    .primaryFilterDateInput(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
    )
    .click();
  await hearingSchedulePage.applyPrimaryFilterButton.click();

  //schedule hearing
  await hearingSchedulePage.waitForLoad();

  await hearingSchedulePage.scheduleHearingWithBasket(
    sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
    sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
    process.env.CASE_NAME as string,
  );

  await sessionBookingPage.bookSession(
    sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
    sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
    sessionBookingPage.CONSTANTS.AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH_TWO,
    sessionBookingPage.CONSTANTS.CASE_LISTING_JURISDICTION_CIVIL_CODE_CIV,
  );

  await clearDownWrexhamSchedule(
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
  );
});

async function assertAdvFilterDropdownOptions(
  dropdown: Locator,
  options: string[],
  page: Page,
) {
  await dropdown.click();
  for (const option of options) {
    await expect(
      page.getByRole("option", { name: option, exact: true }),
    ).toBeVisible();
  }
}

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
