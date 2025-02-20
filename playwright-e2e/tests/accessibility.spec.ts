import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Accessibility test example @a11y", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.urls.baseUrl);
  });

  test("Accessibility example using Axe fixture", async ({
    homePage,
    axeUtils,
    hearingSchedulePage,
  }) => {
    await expect(homePage.sidebarComponent.sidebar).toBeVisible();
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForNavigation();
    // TODO: A lot of a11y failures on this page
    await axeUtils.audit();
  });
});
