import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Case List Tests - Citizen @cui", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.urls.baseUrl);
  });

  test.only("View cases", async ({ homePage }) => {
    await homePage.page.pause();
    await expect(homePage.sidebarComponent.sidebar).toBeVisible();
  });
});
