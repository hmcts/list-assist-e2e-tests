import { expect, test } from '../fixtures';
import { config } from '../utils';

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe('Case creation @add-new-case', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.urls.baseUrl);
  });

  test('Search for case and confirm case details are correct @smoke', async ({
    addNewCasePage,
    editNewCasePage,
    caseDetailsPage,
    caseSearchPage,
  }) => {
    // Test data
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

    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

    //checks case details against known values
    await caseDetailsPage.checkInputtedCaseValues(
      editNewCasePage,
      process.env.HMCTS_CASE_NUMBER as string,
      process.env.CASE_NAME as string,
      caseData.jurisdiction,
      caseData.service,
      caseData.caseType,
      caseData.region,
      caseData.cluster,
      caseData.hearingCentre,
    );

    //LISTING REQUIREMENTS
    await editNewCasePage.sidebarComponent.openListingRequirementsPage();
    //checks header
    await expect
      .poll(
        async () => {
          return await caseDetailsPage.listingRequirementsHeader.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await expect(caseDetailsPage.listingRequirementsHeader).toBeVisible();

    //select hearing type
    await caseDetailsPage.hearingTypeSelect.selectOption(caseData.hearingTypeRef);
    await caseDetailsPage.saveButton.click();

    //CHECK CURRENT DETAILS OF CASE
    await caseDetailsPage.sidebarComponent.openCaseDetailsEditPage();
    await expect(caseDetailsPage.currentCaseCurrentStatusField).toHaveText('Current Status ' + caseData.currentStatus);
  });

  test('Search for and add related case to the existing case', async ({
    addNewCasePage,
    editNewCasePage,
    caseSearchPage,
    dataUtils,
    homePage,
  }) => {
    //create related case
    // Navigate to Add New Case page
    await homePage.sidebarComponent.openAddNewCasePage();

    // Generate case details
    const RELATED_HMCTS_CASE_NUMBER = 'RELATED_HMCTS_CN_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();
    const RELATED_CASE_NAME = 'RELATED_AUTO_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();

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
    await addNewCasePage.addNewCaseWithMandatoryData(caseData, RELATED_HMCTS_CASE_NUMBER, RELATED_CASE_NAME);
    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

    //add related case
    await expect(editNewCasePage.relatedCasesHeader).toBeVisible();
    await expect(editNewCasePage.addRelatedCaseBtn).toBeVisible();
    await editNewCasePage.addRelatedCaseBtn.click();
    await editNewCasePage.quickSearchField.fill(RELATED_HMCTS_CASE_NUMBER);
    await editNewCasePage.clickRelatedCaseResult(RELATED_HMCTS_CASE_NUMBER);
    await editNewCasePage.addRelatedCaseOkBtn.click();
    await editNewCasePage.checkRelatedCaseDisplay(RELATED_CASE_NAME);
  });
});
