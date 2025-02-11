import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Create a session @create-session", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.urls.baseUrl);
  });

  test("Create session", async ({ homePage }) => {
    await expect(homePage.sidebarComponent.sidebar).toBeVisible();
  });
});
