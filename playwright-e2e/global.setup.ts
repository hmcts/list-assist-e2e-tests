import { test as setup } from "./fixtures";
import { isSessionValid } from "./utils";

setup.describe("Global Setup", () => {
  setup.skip("Setup test user", async ({ loginPage, page, config }) => {
    // Test user setup
    const user = config.users.testUser;
    if (!isSessionValid(user.sessionFile, user.cookieName!)) {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
    }
  });

  setup.skip(
    "Create new case",
    async ({
      loginPage,
      config,
      page,
      homePage,
      addNewCasePage,
      hearingSchedulePage,
    }) => {
      setup.skip(process.env.SKIP_CREATE_CASE == "true");

      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);

      await addNewCasePage.addNewCase(homePage, hearingSchedulePage);

      await homePage.upperbarComponent.logoutButton.click();
    },
  );

  setup(
    "Clean down JOH users in sessions",
    async ({ loginPage, page, config, hearingSchedulePage, dataUtils }) => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);

      await hearingSchedulePage.clearDownJohSession(
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    },
  );
});
