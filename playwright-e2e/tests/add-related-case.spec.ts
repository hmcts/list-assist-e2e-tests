import { expect, test } from '../fixtures';
import { config } from '../utils';

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe('Add related case @add-related-case @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.urls.baseUrl);
  });

  test('Add related case to the existing case', async ({
    addNewCasePage,
    editNewCasePage,
    caseSearchPage,
    dataUtils,
  }) => {
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
