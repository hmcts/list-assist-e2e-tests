import { test as setup } from "./fixtures";
import { LoginPage } from "./page-objects/pages/login.po";

setup("Setup test user", async ({ page, config }) => {
  await page.goto(config.urls.baseUrl);
  await new LoginPage(page).login(config.users.testUser);
});
