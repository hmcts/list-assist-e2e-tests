import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Buttons present in upper bar function as expected", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(config.urls.baseUrl);
    await expect(homePage.upperbarComponent.loginButton).toBeVisible();
  });

  test("Logout button is present and functions as expected", async ({
    loginPage,
    homePage,
  }) => {
    await expect(homePage.upperbarComponent.loginButton).toBeVisible();
    await homePage.upperbarComponent.loginButton.click();
    await expect(loginPage.usernameInput).toBeVisible();
  });

  test("Close case button is present and works as expected", async ({
    homePage,
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
  }) => {
    const hmctsCaseNumber = "HMCTS_CN_" + addNewCasePage.hmctsCaseNumber;
    const caseName = "AUTO_" + addNewCasePage.hmctsCaseNumber;

    // Check if the close case button is present
    await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();

    //empties cart if anything present in cart
    await homePage.sidebarComponent.emptyCaseCart();

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

    //press Close case button
    await homePage.upperbarComponent.closeCaseButton.click();

    //wait for page load
    await expect(homePage.header).toBeVisible();

    //confirms case is closed by checking that the case is not in the cart
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeDisabled();
  });
});
