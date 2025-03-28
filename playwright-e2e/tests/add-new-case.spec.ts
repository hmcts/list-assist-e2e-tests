import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Case creation @add-new-case", () => {
  // These tests should be run serially to avoid conflicts
  // Parallel is possible, but needs unique data. e.g. different case & different room
  test.describe.configure({mode: "parallel"});

  test.beforeEach(
    async ({
             page,
             homePage,
           }) => {
      await page.goto(config.urls.baseUrl);
      await homePage.sidebarComponent.openAddNewCasePage();
    })

  test("Create new case and confirm case is created correctly @smoke", async ({ addNewCasePage, editNewCasePage, caseDetailsPage }) => {

    // Test data
    const data = {
      hmctsCaseNumberHeaderValue: "HMCTS Case Number",
      caseNameHeaderValue: "Case Name",
      familyJurisdiction: "Family",
      divorceService: "Divorce",
      decreeAbsoluteCaseType: "Decree Absolute",
      walesRegion: "Wales",
      walesTribCluster: "Wales Civil, Family and Tribunals",
      cardiffCivilHearing: "Cardiff Civil and Family Justice Centre",
      applicationHearingTypeRef: "449628128",
      currentStatusAwaitingListing: "Awaiting Listing"
    };

    const hmctsCaseNumber = "HMCTS_CN_" + addNewCasePage.hmctsCaseNumber;
    const caseName = "AUTO_" + addNewCasePage.hmctsCaseNumber;

    //ADD NEW CASE FORM
    // Assert that the header contains the text 'New Case'
    await expect(addNewCasePage.newCaseHeader).toHaveText('New Case');
    // Assert that sidebar is visible
    await expect(addNewCasePage.sidebarComponent.sidebar).toBeVisible()
    //Populate new case details form
    await addNewCasePage.populateNewCaseDetails(
      hmctsCaseNumber,
      caseName,
      data.familyJurisdiction
    );
    //click save button
    await addNewCasePage.saveButton.click();

    // Assert that the new case has been created
    // Assert that the header contains HMCTS case number and case name set when creating the case
    await expect(editNewCasePage.newCaseHeader).toHaveText(`Case ${hmctsCaseNumber} (${caseName})`);

    //checks case details against known values
    await caseDetailsPage.checkInputtedCaseValues(
      editNewCasePage,
      hmctsCaseNumber,
      caseName,
      data.familyJurisdiction,
      data.divorceService,
      data.decreeAbsoluteCaseType,
      data.walesRegion,
      data.walesTribCluster,
      data.cardiffCivilHearing
    );

    //LISTING REQUIREMENTS
    await editNewCasePage.sidebarComponent.openCurrentCasePage();
    //checks header
    await expect(caseDetailsPage.listingRequirementsHeader).toBeVisible();

    //select hearing type
    await caseDetailsPage.hearingTypeSelect.selectOption(data.applicationHearingTypeRef);
    await caseDetailsPage.saveButton.click();

    //CHECK CURRENT DETAILS OF CASE
    await caseDetailsPage.sidebarComponent.openCaseDetailsEditPage();
    await expect(caseDetailsPage.currentCaseCurrentStatusField).toHaveText("Current Status " + data.currentStatusAwaitingListing);

    //Close case
    await caseDetailsPage.closeCaseButton.click();
    await caseDetailsPage.headerTitle.isVisible();
  })
})
