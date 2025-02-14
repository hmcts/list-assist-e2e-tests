import { expect, test } from "../fixtures"; // Import from the centralized fixtures.ts
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
  }) => {
    await expect(homePage.sidebarComponent.sidebar).toBeVisible();
    await axeUtils.audit();
  });
});
