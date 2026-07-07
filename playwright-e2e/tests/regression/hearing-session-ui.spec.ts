import type { Locator, Page } from "@playwright/test";
import {
  allRegions,
  allClusters,
  allLocalities,
  allLocations,
  CardiffLocations,
  NewportLocations,
} from "../../data/drop-down-data";
import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";

test.describe("Hearing session UI test @hearing-session-ui-test", () => {
  test.describe.configure({ mode: "serial" });
});

test("Filter and display JOH exclusion filter correctly using tier exclusion @hearing-session-ui-test @regression", async ({
  page,
  loginPage,
  hearingSchedulePage,
  sessionBookingPage,
}) => {
  await page.goto(config.urls.baseUrl);
  await loginPage.login(config.users.testUser);

  await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
  await hearingSchedulePage.waitForLoad();

  await sessionBookingPage.advancedFiltersButton.click();
  await expect(sessionBookingPage.advancedFiltersHeader).toBeVisible();
  await sessionBookingPage.clearAdvanceFilterButton.click();

  await page.getByRole("button", { name: "Who", exact: true }).click();

  await hearingSchedulePage.johTierExclusionFilter.click();
  await page
    .getByRole("textbox", { name: "JOH Tier (Exclusion)" })
    .fill("District Judge");
  await hearingSchedulePage.johTierExclusionListSelect
    .getByText("District Judge", { exact: true })
    .click();
  await hearingSchedulePage.johTierExclusionToggleClose.click();

  await hearingSchedulePage.johExclusionFilter.click();
  const options =
    await hearingSchedulePage.johExlusionListOptions.allTextContents();

  // Trim whitespace from each option
  const trimmedOptions = options.map((opt) => opt.trim());

  await expect(trimmedOptions).toContain("AutomationTest, JOH");
  await expect(trimmedOptions).not.toContain("JOH-Two AutomationTest");
});

test("Advanced filters show expected Wales/Cardiff+Newport, then Wales/Cardiff only, then no filters applied @hearing-session-ui-test @regression", async ({
  page,
  loginPage,
  hearingSchedulePage,
  sessionBookingPage,
  addNewCasePage,
}) => {
  await test.step("Login and open Hearing Schedule advanced filters", async () => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser);

    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();

    await sessionBookingPage.advancedFiltersButton.click();
    await expect(sessionBookingPage.advancedFiltersHeader).toBeVisible();
    await sessionBookingPage.clearAdvanceFilterButton.click();
  });

  await test.step("Apply Wales region, Wales Civil/Family cluster, Cardiff and Newport localities", async () => {
    await sessionBookingPage.regionDropdown.click();
    await selectAdvFilterOption(
      page,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
    );

    await sessionBookingPage.clusterDropDown.click();
    await selectAdvFilterOption(
      page,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
    );

    await sessionBookingPage.localityDropDown.click();
    await selectAdvFilterOption(
      page,
      addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
    );
    await selectAdvFilterOption(
      page,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
    );
  });

  await test.step("Assert combined Cardiff + Newport locations", async () => {
    await assertAdvFilterDropdownContainsOptions(
      sessionBookingPage.locationDropDown,
      [...CardiffLocations, ...NewportLocations],
      page,
    );
  });

  await test.step("Clear filters and apply Wales/Cardiff only", async () => {
    await sessionBookingPage.clearAdvanceFilterButton.click();

    await sessionBookingPage.regionDropdown.click();
    await selectAdvFilterOption(
      page,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
    );

    await sessionBookingPage.clusterDropDown.click();
    await selectAdvFilterOption(
      page,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
    );

    await sessionBookingPage.localityDropDown.click();
    await selectAdvFilterOption(
      page,
      addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
    );
    await page.keyboard.press("Escape");
  });

  await test.step("Assert Wales/Cardiff locations and no Newport dataset entries", async () => {
    await sessionBookingPage.locationDropDown.click();
    const locationOptions = (
      await page
        .locator(".multiselect__content-wrapper:visible")
        .getByRole("option")
        .allTextContents()
    ).map((opt) => opt.trim());

    await expect(locationOptions).toEqual(
      expect.arrayContaining(CardiffLocations),
    );
    await expect(
      NewportLocations.every(
        (newportLocation) => !locationOptions.includes(newportLocation),
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
  });

  await test.step("Clear filters and assert all default advanced filter values", async () => {
    await sessionBookingPage.clearAdvanceFilterButton.click();

    await assertAdvFilterDropdownOptions(
      sessionBookingPage.regionDropdown,
      allRegions,
      page,
    );

    await assertAdvFilterDropdownOptions(
      sessionBookingPage.clusterDropDown,
      allClusters,
      page,
    );

    await assertAdvFilterDropdownOptions(
      sessionBookingPage.localityDropDown,
      allLocalities,
      page,
    );

    await assertAdvFilterDropdownOptions(
      sessionBookingPage.locationDropDown,
      allLocations,
      page,
    );
  });
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
  await page.keyboard.press("Escape");
}

async function assertAdvFilterDropdownContainsOptions(
  dropdown: Locator,
  expectedOptions: string[],
  page: Page,
  excludedOptions: string[] = [],
  forbiddenSubstring: string = "",
) {
  await dropdown.click();
  const optionLocator = page
    .locator(".multiselect__content-wrapper:visible")
    .getByRole("option");
  const actualOptions = (await optionLocator.allTextContents())
    .map((option) => option.trim())
    .filter((option) => !excludedOptions.includes(option));

  await expect(actualOptions).toEqual(expect.arrayContaining(expectedOptions));
  if (forbiddenSubstring) {
    await expect(
      actualOptions.some((option) => option.includes(forbiddenSubstring)),
    ).toBe(false);
  }
  await page.keyboard.press("Escape");
}

async function selectAdvFilterOption(page: Page, option: string) {
  await page
    .getByRole("option", { name: option, exact: true })
    .locator("span")
    .nth(2)
    .click();
}
