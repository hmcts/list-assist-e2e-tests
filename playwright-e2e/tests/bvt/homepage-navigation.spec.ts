import { expect, test } from "../../fixtures";
import { config } from "../../utils";
import { sidebarMenu } from "../../data/ui-components-data";

test.describe("Logout functionality @homepage-ui-test @nightly @smoke", () => {
  // test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await loginPage.login();
  });

  test.afterEach(async ({ homePage, loginPage }) => {
    await homePage.upperbarComponent.logoutButton.click();
    await expect(loginPage.usernameInput).toBeVisible();
  });
});

test.describe("Upper bar UI @homepage-ui-test @smoke", () => {
  test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await loginPage.login();
  });

  test.afterEach(async ({ homePage }) => {
    await homePage.upperbarComponent.logoutButton.click();
  });

  test("Help button is present and works as expected @smoke", async ({
    homePage,
  }) => {
    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();
    await expect(homePage.upperbarComponent.helpButton).toBeVisible();

    //checks popup is present
    const waitForCreateNewPartyPopup = homePage.page.waitForEvent("popup");
    await homePage.upperbarComponent.helpButton.click();
    const helpDialogPopup = await waitForCreateNewPartyPopup;
    expect(helpDialogPopup).toBeTruthy();
  });
});

test.describe("Sidebar Menu @sidebar @homepage-ui-test @smoke", () => {
  test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await loginPage.login();
  });

  test.afterEach(async ({ homePage }) => {
    await homePage.upperbarComponent.logoutButton.click();
  });

  test("All expected sidebar menu items are present @smoke", async ({
    homePage,
  }) => {
    await homePage.waitForHomePageLoad();

    // Select all top-level menu item names
    const menuItems = await homePage.page.$$eval(
      "ul.sidebar-menu > li > a > span > span",
      (elements) => elements.map((el) => el.textContent?.trim()),
    );

    for (const name of sidebarMenu.menuNames) {
      expect(menuItems).toContain(name.trim());
    }
  });
});
