import { test as setup } from './fixtures';
import { LoginPage } from './page-objects/pages/login.po';
import { isSessionValid } from './utils';

setup(
  'Setup test user and create new case',
  async ({ page, config, homePage, addNewCasePage, hearingSchedulePage, dataUtils }) => {
    //test user setup
    const user = config.users.testUser;
    if (!isSessionValid(user.sessionFile, user.cookieName!)) {
      await page.goto(config.urls.baseUrl);
      await new LoginPage(page).login(config.users.testUser);
    }

    await page.goto(config.urls.baseUrl);
    await new LoginPage(page).login(config.users.testUser);

    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    //creates new case for all tests
    await homePage.sidebarComponent.openAddNewCasePage();

    // Generate case details
    process.env.HMCTS_CASE_NUMBER = 'HMCTS_CN_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();
    process.env.CASE_NAME = 'AUTO_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();

    const caseData = {
      hmctsCaseNumberHeaderValue: addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
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

    await addNewCasePage.addNewCaseWithMandatoryData(caseData, process.env.HMCTS_CASE_NUMBER, process.env.CASE_NAME);
  },
);
