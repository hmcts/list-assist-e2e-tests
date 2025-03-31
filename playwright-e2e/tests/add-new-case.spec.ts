import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Case creation @add-new-case", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(config.urls.baseUrl);
    await homePage.sidebarComponent.openAddNewCasePage();
  });

  test("Create new case and confirm case is created correctly @smoke", async ({
    addNewCasePage,
    editNewCasePage,
    caseDetailsPage,
  }) => {
    // Test data
    const caseData = {
      hmctsCaseNumberHeaderValue: "HMCTS Case Number",
      caseNameHeaderValue: "Case Name",
      jurisdiction: "Family",
      service: "Divorce",
      caseType: "Decree Absolute",
      region: "Wales",
      cluster: "Wales Civil, Family and Tribunals",
      hearingCentre: "Cardiff Civil and Family Justice Centre",
      hearingTypeRef: "449628128",
      currentStatus: "Awaiting Listing",
    };

    const hmctsCaseNumber = "HMCTS_CN_" + addNewCasePage.hmctsCaseNumber;
    const caseName = "AUTO_" + addNewCasePage.hmctsCaseNumber;

    //ADD NEW CASE FORM
    // Assert that the header contains the text 'New Case'
    await expect(addNewCasePage.newCaseHeader).toHaveText("New Case");
    // Assert that sidebar is visible
    await expect(addNewCasePage.sidebarComponent.sidebar).toBeVisible();
    //Populate new case details form
    await addNewCasePage.populateNewCaseDetails(
      hmctsCaseNumber,
      caseName,
      caseData.jurisdiction,
      caseData.service,
      caseData.caseType,
      caseData.region,
      caseData.cluster,
      caseData.hearingCentre
    );
    //click save button
    await addNewCasePage.saveButton.click();

    // Assert that the new case has been created
    // Assert that the header contains HMCTS case number and case name set when creating the case
    await expect(editNewCasePage.newCaseHeader).toHaveText(
      `Case ${hmctsCaseNumber} (${caseName})`
    );

    //checks case details against known values
    await caseDetailsPage.checkInputtedCaseValues(
      editNewCasePage,
      hmctsCaseNumber,
      caseName,
      caseData.jurisdiction,
      caseData.service,
      caseData.caseType,
      caseData.region,
      caseData.cluster,
      caseData.hearingCentre
    );

    //LISTING REQUIREMENTS
    await editNewCasePage.sidebarComponent.openListingRequirementsPage();
    //checks header
    await expect(caseDetailsPage.listingRequirementsHeader).toBeVisible();

    //select hearing type
    await caseDetailsPage.hearingTypeSelect.selectOption(
      caseData.hearingTypeRef
    );
    await caseDetailsPage.saveButton.click();

    //CHECK CURRENT DETAILS OF CASE
    await caseDetailsPage.sidebarComponent.openCaseDetailsEditPage();
    await expect(caseDetailsPage.currentCaseCurrentStatusField).toHaveText(
      "Current Status " + caseData.currentStatus
    );

    //Close case
    await caseDetailsPage.closeCaseButton.click();
    await caseDetailsPage.headerTitle.isVisible();
  });
});
