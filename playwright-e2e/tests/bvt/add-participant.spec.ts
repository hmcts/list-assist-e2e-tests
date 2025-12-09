import { expect, test } from "../../fixtures";
import { config } from "../../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Add participant @add-participant", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(async ({ page }) => {
    await page.goto(config.urls.baseUrl);
  });

  test("Add new participant via Case Participants menu to case and then close participant using topbar UI", async ({
    addNewCasePage,
    editNewCasePage,
    caseSearchPage,
    dataUtils,
    homePage,
  }) => {
    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

    //add new participant
    await expect(editNewCasePage.caseParticipantsHeader).toBeVisible();
    await expect(editNewCasePage.addNewParticipantButton).toBeVisible();
    await editNewCasePage.addNewParticipantButton.click();

    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);

    await editNewCasePage.createNewParticipant(
      editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_PERSON,
      editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_INDIVIDUAL,
      givenName,
      lastName,
      editNewCasePage.CONSTANTS.PARTICIPANT_GENDER_MALE,
      dataUtils.generateDobInDdMmYyyyForwardSlashSeparators(
        dataUtils.getRandomNumberBetween1And50(),
      ),
      editNewCasePage.CONSTANTS.PARTICIPANT_INTERPRETER_WELSH,
      editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_APPLICANT,
    );

    await editNewCasePage.checkCaseParticipantTable(
      editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
      `${lastName}, ${givenName}`,
      editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
    );

    //use close participant button
    await expect(
      editNewCasePage.upperbarComponent.closeParticipantButton,
    ).toBeVisible();
    await editNewCasePage.upperbarComponent.closeParticipantButton.click();

    //wait for homepage to load
    await homePage.waitForHomePageLoad();
  });

  test("Add new participant via Participants menu and close via topbar UI", async ({
    homePage,
    dataUtils,
    newParticipantsPage,
  }) => {
    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);

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

  test("Case history should display correct event codes @codes", async ({
    homePage,
    dataUtils,
  }) => {
    await homePage.sidebarComponent.caseFileNotesPage();
    await homePage.sidebarComponent.currentCaseEventType.selectOption({
      label: "File Note",
    });

    const comment = dataUtils.generateRandomAlphabetical(20);
    await homePage.sidebarComponent.addCaseFileNotes(comment);
    await homePage.sidebarComponent.fileNoteSaveButton.click();

    //search and verify File Note in case history
    await homePage.sidebarComponent.searchCaseNotesAndAssertVisible(
      comment,
      comment,
    );

    //search and verify Allocate event code
    await homePage.sidebarComponent.searchCaseNotesAndAssertVisible(
      "Allocate",
      "Initial Allocation",
    );

    //search and verify Registration event code
    await homePage.sidebarComponent.searchCaseNotesAndAssertVisible(
      "Registration",
      "Initiating Document",
    );
  });
});
