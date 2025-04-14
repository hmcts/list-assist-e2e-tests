import { expect, test } from "../fixtures";
import { config } from "../utils";

test.describe("Logout functionality", () => {
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

test.describe("Upper bar functionality", () => {
  test.use({
    storageState: config.users.testUser.sessionFile,
  });

  test("Close case buttons is present and works as expected @smoke", async ({
    homePage,
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
  }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();

    const hmctsCaseNumber = "HMCTS_CN_" + addNewCasePage.hmctsCaseNumber;
    const caseName = "AUTO_" + addNewCasePage.hmctsCaseNumber;

    //empties cart if anything present in cart
    await homePage.sidebarComponent.emptyCaseCart();

    // Check if the close case button is present
    await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();

    // Test data
    const caseData = {
      hmctsCaseNumberHeaderValue:
        addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
      caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
      jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
      service: addNewCasePage.CONSTANTS.SERVICE_DIVORCE,
      caseType: addNewCasePage.CONSTANTS.DECREE_ABSOLUTE_CASE_TYPE,
      region: addNewCasePage.CONSTANTS.REGION_WALES,
      cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
      hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
      currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
    };

    //create a new case
    await homePage.sidebarComponent.openAddNewCasePage();
    await addNewCasePage.addNewCaseWithMandatoryData(
      caseData,
      hmctsCaseNumber,
      caseName,
    );

    //add case to cart
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(caseName);
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

    //check current case drop down menu
    await expect(
      homePage.upperbarComponent.currentCaseDropdownButton,
    ).toBeVisible();
    await homePage.upperbarComponent.currentCaseDropdownButton.click();
    await expect(
      homePage.upperbarComponent.currentCaseDropdownList,
    ).toContainText(homePage.upperbarComponent.currentCaseDropDownItems);

    //press Close case button
    await homePage.upperbarComponent.closeCaseButton.click();

    //wait for page load
    await homePage.waitForHomePageLoad();

    //confirms case is closed by checking that the case is not in the cart
    await homePage.sidebarComponent.checkCartButtonDisabled();
  });

  test("Close participant buttons is present and works as expected @smoke", async ({
    homePage,
    dataUtils,
    newParticipantsPage,
  }) => {
    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);

    await homePage.page.goto(config.urls.baseUrl);
    await expect(homePage.upperbarComponent.logoutButton).toBeVisible();

    await expect(
      homePage.upperbarComponent.closeParticipantButton,
    ).toBeVisible();

    // Add new participant
    await homePage.sidebarComponent.openAddNewParticipantPage();

    await newParticipantsPage.populateNewParticipantFormWithMandatoryData(
      givenName,
      lastName,
      newParticipantsPage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER_CYM,
    );

    await newParticipantsPage.checkEditParticipantHeader();

    //checks current participant drop down menu
    await expect(
      homePage.upperbarComponent.currentParticipantDropdownButton,
    ).toBeVisible();
    await homePage.upperbarComponent.currentParticipantDropdownButton.click();
    await expect(
      homePage.upperbarComponent.currentParticipantDropdownList,
    ).toContainText(homePage.upperbarComponent.currentParticipantDropDownItems);

    //use close participant button
    await expect(
      homePage.upperbarComponent.closeParticipantButton,
    ).toBeVisible();
    await homePage.upperbarComponent.closeParticipantButton.click();

    //wait for homepage to load
    await homePage.waitForHomePageLoad();
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
