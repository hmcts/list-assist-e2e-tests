import fs from 'fs/promises';
import path from 'path';

export class CreateCasesUtils {
  async createAllCases({ loginPage, addNewCasePage, config, page, homePage, hearingSchedulePage, dataUtils }) {
    await homePage.page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser, true);

    // Path to case-references.json
    const userJsonPath = path.resolve(
      path.dirname(new URL('', import.meta.url).pathname),
      '../data/case-references.json',
    );
    const userJson = JSON.parse(await fs.readFile(userJsonPath, 'utf-8'));

    // Helper to create a case and update userJson
    const createCaseAndStoreCaseInJson = async (caseNumberKey: string, caseNameKey: string) => {
      const hmctsCaseNumber = 'HMCTS_CN_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();
      const caseName = 'AUTO_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();

      await this.createCase({
        config,
        page,
        homePage,
        addNewCasePage,
        hearingSchedulePage,
        hmctsCaseNumber,
        caseName,
      });

      userJson[caseNumberKey] = hmctsCaseNumber;
      userJson[caseNameKey] = caseName;
      await fs.writeFile(userJsonPath, JSON.stringify(userJson, null, 2), 'utf-8');
    };

    await createCaseAndStoreCaseInJson('ADD_NEW_CASE_HMCTS_CASE_NUMBER', 'ADD_NEW_CASE_CASE_NAME');
    await createCaseAndStoreCaseInJson('RELATED_CASE_HMCTS_CASE_NUMBER', 'RELATED_CASE_CASE_NAME');
    await createCaseAndStoreCaseInJson('HEARING_CHANNEL_HMCTS_CASE_NUMBER', 'HEARING_CHANNEL_CASE_NAME');
    await createCaseAndStoreCaseInJson('ADD_PARTICIPANT_HMCTS_CASE_NUMBER', 'ADD_PARTICIPANT_CASE_NAME');
    await createCaseAndStoreCaseInJson('CASE_LISTING_HMCTS_CASE_NUMBER', 'CASE_LISTING_CASE_NAME');
    await createCaseAndStoreCaseInJson('UI_TESTS_HMCTS_CASE_NUMBER', 'UI_TESTS_CASE_NAME');
  }

  private async createCase({ config, page, homePage, addNewCasePage, hearingSchedulePage, hmctsCaseNumber, caseName }) {
    await page.goto(config.urls.baseUrl);

    // Empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    // Navigate to Add New Case page
    await homePage.sidebarComponent.openAddNewCasePage();

    const caseData = {
      hmctsCaseNumberHeaderValue: addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
      caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
      jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
      service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
      caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
      region: addNewCasePage.CONSTANTS.REGION_WALES,
      cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
      hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
      currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
    };

    // Create the new case
    await addNewCasePage.addNewCaseWithMandatoryData(caseData, hmctsCaseNumber, caseName);
  }
}
