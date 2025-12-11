import { test as setup } from "./fixtures";
import { isSessionValid } from "./utils";

setup.describe("Global Setup", () => {
  setup("Setup test user", async ({ loginPage, page, config }) => {
    // Test user setup
    const user = config.users.testUser;
    if (!isSessionValid(user.sessionFile, user.cookieName!)) {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
    }
  });

  if (process.env.SKIP_CREATE_CASE !== "true") {
    setup(
      "Create new case",
      async ({
        loginPage,
        config,
        page,
        homePage,
        addNewCasePage,
        hearingSchedulePage,
      }) => {
        await page.goto(config.urls.baseUrl);
        await loginPage.login(config.users.testUser);

        // Empties cart if there is anything present
        await hearingSchedulePage.sidebarComponent.emptyCaseCart();

        // Navigate to Add New Case page
        await homePage.sidebarComponent.openAddNewCasePage();

        // Generate case details
        process.env.HMCTS_CASE_NUMBER =
          "HMCTS_CN_" + crypto.randomUUID().toUpperCase();
        process.env.CASE_NAME = "AUTO_" + crypto.randomUUID().toUpperCase();

        const caseData = {
          hmctsCaseNumberHeaderValue:
            addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
          caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
          jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
          service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
          caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
          region: addNewCasePage.CONSTANTS.REGION_WALES,
          cluster:
            addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
          hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
          hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
          currentStatus:
            addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
        };

        // Create the new case
        await addNewCasePage.addNewCaseWithMandatoryData(
          caseData,
          process.env.HMCTS_CASE_NUMBER,
          process.env.CASE_NAME,
        );
      },
    );
  } else {
    console.log("Skipping 'Create new case' setup due to SKIP_CREATE_CASE");
  }
});
