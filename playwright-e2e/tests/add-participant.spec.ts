import { expect, test } from "../fixtures";
import { config } from "../utils";

import {generateDobInDdMmYyyy, generateRandomAlphabetical, getRandomNumberBetween1And50} from "../utils/data-utils.ts";

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
      hmctsCaseNumberHeaderValue:
        addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
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
      editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_PERSON,
      editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_INDIVIDUAL,
      givenName,
      lastName,
      editNewCasePage.CONSTANTS.PARTICIPANT_GENDER_MALE,
      generateDobInDdMmYyyy(getRandomNumberBetween1And50()),
      editNewCasePage.CONSTANTS.PARTICIPANT_INTERPRETER_WELSH,
      editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_APPLICANT,
    );

    await editNewCasePage.checkCaseParticipantTable(
      editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
      `${lastName}, ${givenName}`,
      editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
    );
  });
});
