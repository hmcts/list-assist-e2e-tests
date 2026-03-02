import type { Locator, Page } from "@playwright/test";
import {
  regions,
  clusters,
  localities,
  locations,
} from "../../data/drop-down-data";
import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";

test.describe("Hearing session UI test", () => {
  test.describe.configure({ mode: "serial" });
});

test("Check all expected values are present in advanced filters @hs-ui", async ({
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
  //ensure the advanced filter is cleared
  await sessionBookingPage.clearAdvanceFilterButton.click();

  //region dropdown
  await assertAdvFilterDropdownOptions(
    sessionBookingPage.regionDropdown,
    regions,
    page,
  );

  //cluster dropdown
  await assertAdvFilterDropdownOptions(
    sessionBookingPage.clusterDropDown,
    clusters,
    page,
  );

  //locality dropdown
  await assertAdvFilterDropdownOptions(
    sessionBookingPage.localityDropDown,
    localities,
    page,
  );

  //location dropdown
  await assertAdvFilterDropdownOptions(
    sessionBookingPage.locationDropDown,
    locations,
    page,
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
