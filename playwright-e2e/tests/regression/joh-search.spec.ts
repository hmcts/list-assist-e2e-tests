import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";

test.describe("JOH Search", () => {
  test.describe.configure({ mode: "serial" });
});

test.only("search for JOHs by a criteria", async ({
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

  //region dropdown and region selection
  await sessionBookingPage.regionDropdown.click();

  for (const region of regions) {
    await expect(page.getByRole("option", { name: region })).toBeVisible();
  }
});

// Regions in the dropdown
const regions = [
  "London",
  "Midlands",
  "National (non-Regional)",
  "North East",
  "North West",
  "Scotland",
  "South East",
  "South West",
  "Wales",
];
