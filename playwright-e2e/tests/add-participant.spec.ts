import { expect, test } from "../fixtures";
import { config } from "../utils";
import {
  generateRandomAlphabetical,
  generateDobInDdMmYyyy,
  getRandomNumberBetween1And50,
  TestData,
} from "../test-data";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Add participant @add-participant", () => {
  test.beforeEach(async ({ page, homePage }) => {
    await page.goto(config.urls.baseUrl);
    await homePage.sidebarComponent.openAddNewCasePage();
  });

  test("Add new participant to case @smoke", async ({
    addNewCasePage,
    editNewCasePage,
  }) => {
    // Test data
    const caseData = {
      hmctsCaseNumberHeaderValue: TestData.HMCTS_CASE_NUMBER_HEADER_VALUE,
      caseNameHeaderValue: TestData.CASE_NAME_HEADER_VALUE,
      jurisdiction: TestData.JURISDICTION_FAMILY,
      service: TestData.SERVICE_DIVORCE,
      caseType: TestData.DECREE_ABSOLUTE_CASE_TYPE,
      region: TestData.REGION_WALES,
      cluster: TestData.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      hearingCentre: TestData.HEARING_CENTRE_CARDIFF,
      hearingTypeRef: TestData.HEARING_TYPE_APPLICATION_REF,
      currentStatus: TestData.CURRENT_STATUS_AWAITING_LISTING,
    };

    const hmctsCaseNumber = "HMCTS_CN_" + addNewCasePage.hmctsCaseNumber;
    const caseName = "AUTO_" + addNewCasePage.hmctsCaseNumber;

    await addNewCasePage.addNewCaseWithMandatoryData(
      caseData,
      hmctsCaseNumber,
      caseName,
    );

    // Assert that the new case has been created
    // Assert that the header contains HMCTS case number and case name set when creating the case
    await expect(editNewCasePage.newCaseHeader).toHaveText(
      `Case ${hmctsCaseNumber} (${caseName})`,
    );

    //add new participant
    await expect(editNewCasePage.caseParticipantsHeader).toBeVisible();
    await expect(editNewCasePage.addNewParticipantButton).toBeVisible();
    await editNewCasePage.addNewParticipantButton.click();

    const givenName = generateRandomAlphabetical(7);
    const lastName = generateRandomAlphabetical(8);

    await editNewCasePage.createNewParticipant(
      TestData.PARTICIPANT_CLASS_PERSON,
      TestData.PARTICIPANT_TYPE_INDIVIDUAL,
      givenName,
      lastName,
      TestData.PARTICIPANT_GENDER_MALE,
      generateDobInDdMmYyyy(getRandomNumberBetween1And50()),
      TestData.PARTICIPANT_INTERPRETER_CYM,
      TestData.PARTICIPANT_ROLE_APPLICANT,
    );

    await editNewCasePage.checkCaseParticipantTable(
      TestData.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
      `${lastName}, ${givenName}`,
      TestData.CASE_PARTICIPANT_TABLE_INTERPRETER,
    );
  });
});
