import { test, expect } from '../fixtures';

test.describe('Case creation for all tests @add-new-case', () => {
  test.describe.configure({ mode: 'serial' });

  test('Add new cases for all tests', async ({
    loginPage,
    addNewCasePage,
    config,
    page,
    homePage,
    hearingSchedulePage,
    dataUtils,
    createCasesUtils,
  }) => {
    // Create cases for tests
    await createCasesUtils.createAllCases({
      loginPage,
      addNewCasePage,
      config,
      page,
      homePage,
      hearingSchedulePage,
      dataUtils,
    });
  });

  test('Search for case and confirm case details are correct @smoke', async ({
    homePage,
    loginPage,
    config,
    addNewCasePage,
    editNewCasePage,
    caseDetailsPage,
    caseSearchPage,
    dataUtils,
  }) => {
    const caseRefData = await dataUtils.getCaseDataFromCaseRefJson();
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

    await homePage.page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser, true);

    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(caseRefData.addNewCaseCaseName);

    //checks case details against known values
    await caseDetailsPage.checkInputtedCaseValues(
      editNewCasePage,
      caseRefData.addNewHmctsCaseNumber,
      caseRefData.addNewCaseCaseName,
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

  test('Add related case to the existing case', async ({
    homePage,
    loginPage,
    config,
    addNewCasePage,
    editNewCasePage,
    caseSearchPage,
    dataUtils,
  }) => {
    await homePage.page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser, true);
    //open add new case page
    await addNewCasePage.sidebarComponent.openSearchCasePage();

    //search for existing case to add related case
    const caseRefData = await dataUtils.getCaseDataFromCaseRefJson();
    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(caseRefData.addNewCaseCaseName);

    //add related case
    await expect(editNewCasePage.relatedCasesHeader).toBeVisible();
    await expect(editNewCasePage.addRelatedCaseBtn).toBeVisible();
    await editNewCasePage.addRelatedCaseBtn.click();
    await editNewCasePage.quickSearchField.fill(caseRefData.relatedCaseHmctsCaseNumber);
    await editNewCasePage.clickRelatedCaseResult(caseRefData.relatedCaseHmctsCaseNumber);
    await editNewCasePage.addRelatedCaseOkBtn.click();
    await editNewCasePage.checkRelatedCaseDisplay(caseRefData.relatedCaseCaseName);
  });
});
