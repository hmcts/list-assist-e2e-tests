import { test as setup } from "./fixtures";
import { LoginPage } from "./page-objects/pages/login.po";
import { isSessionValid } from "./utils";

setup("Setup test user", async ({ page, config }) => {
  const user = config.users.testUser;
  if (!isSessionValid(user.sessionFile, user.cookieName!)) {
    await page.goto(config.urls.baseUrl);
    await new LoginPage(page).login(config.users.testUser);
  }
});
