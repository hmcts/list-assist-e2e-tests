import { expect, test } from "../fixtures";
import { config } from "../utils";

test.describe("Logout functionality @ui-test", () => {
  test("Logout button is present and functions as expected @smoke", async ({
    loginPage,
    homePage,
    config,
  }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser, true);
    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();

    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();
    await homePage.upperbarComponent.logoutButton.click();
    await expect(loginPage.usernameInput).toBeVisible();
  });
});

test.describe("Upper bar UI @ui-test", () => {
  test.use({
    storageState: config.users.testUser.sessionFile,
  });

  test("Close case buttons is present", async ({
    homePage,
  }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();

    //empties cart if anything present in cart
    await homePage.sidebarComponent.emptyCaseCart();

    // Check if the close case button is present
    await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();
  });

  test("Close participant button is present and works as expected @smoke", async ({
    homePage,
  }) => {

    await homePage.page.goto(config.urls.baseUrl);
    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();

    await expect(
      homePage.upperbarComponent.closeParticipantButton,
    ).toBeVisible();
  });

  test("Help button is present and works as expected @smoke", async ({
    homePage,
  }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();
    await expect(homePage.upperbarComponent.helpButton).toBeVisible();

    //checks popup is present
    const waitForCreateNewPartyPopup = homePage.page.waitForEvent("popup");
    await homePage.upperbarComponent.helpButton.click();
    const helpDialogPopup = await waitForCreateNewPartyPopup;
    await expect(helpDialogPopup).toBeTruthy();
  });
});
