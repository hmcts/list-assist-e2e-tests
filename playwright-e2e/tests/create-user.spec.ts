import { expect, test } from "../fixtures";
import { config } from "../utils";

test.describe("Add user @add-user", () => {
  test("Add new user as Listing Officer", async ({
    dataUtils,
    homePage,
    page,
    loginPage,
    createUserPage,
  }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser, true);

    await homePage.sidebarComponent.administrationMenu.click();
    await homePage.sidebarComponent.userMenu.click();

    await createUserPage.createUserButton.click();

    const userLoginId = ("AUTO_USER_" + crypto.randomUUID())
      .replace(/-/g, "")
      .toUpperCase();

    await createUserPage.userLoginId.fill(userLoginId);
    await createUserPage.userEmail.fill("test@email.com");
    await createUserPage.userPassword.fill(process.env.TEST_PASSWORD as string);
    await createUserPage.userConfirmPassword.fill(
      process.env.TEST_PASSWORD as string,
    );
    await createUserPage.userGivenName.fill("Auto");
    await createUserPage.userSurName.fill("User");

    //selecting region
    await createUserPage.selectRegion("Wales");

    //clicking random label to make region entry
    await createUserPage.userDetailLabel.click();

    //selecting primary cluster
    await createUserPage.selectCluster("Wales Civil, Family and Tribunals");

    //user detail save button
    await createUserPage.userDetailSaveButton.click();

    //adding 5 second wait to let table contents populated
    await page.waitForTimeout(5_000);

    await createUserPage.searchUserTxt.fill(userLoginId);
    const editUserButton = page.locator(`#edit_${userLoginId}`);
    await editUserButton.click();

    //System Detail tab

    await createUserPage.systemDetailTab.click();
    await createUserPage.userActiveFromDate.fill(
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );
    await createUserPage.userActiveToDate.fill(
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(5),
    );

    // security group
    await createUserPage.selectSecurityGroup("Listing (Management)");
    await createUserPage.resourceManagementLabel.click();

    // HS Locality
    await createUserPage.selectLocality("Cardiff Crown Court");
    await createUserPage.resourceManagementLabel.click();

    //security type
    await createUserPage.selectSecurityType("Record Keeping");
    await createUserPage.resourceManagementLabel.click();

    //saving user system details
    await createUserPage.userSystemDetailSaveButton.click();

    //jurisdiction tab
    await createUserPage.jurisdictionTab.click();
    await createUserPage.addJurisdictionBtn.click();

    await createUserPage.selectJurisdiction("Court of Protection");
    await createUserPage.userSystemDetailSaveButton.click();

    // clear cache
    await homePage.sidebarComponent.administrationMenu.click();
    await homePage.sidebarComponent.codeManagerMenu.click();
    await homePage.sidebarComponent.cacheRefreshBtn.click();
    await homePage.sidebarComponent.waitCacheRefresh();

    // logout admin test user
    await homePage.upperbarComponent.logoutButton.click();

    // login with new user
    await loginPage.usernameInput.fill(userLoginId);
    await loginPage.passwordInput.fill(process.env.TEST_PASSWORD as string);
    await loginPage.submitBtn.click();

    // assert new user welcome message
    await expect(homePage.welcomeUserHeading).toHaveText("Welcome Auto User");
  });
});
