import { Page, expect } from '@playwright/test';
import { Base } from '../../base';

export class EditNewCasePage extends Base {
  readonly CONSTANTS = {
    //add participant
    PARTICIPANT_CLASS_PERSON: 'PERSON',
    PARTICIPANT_TYPE_INDIVIDUAL: 'IND',
    PARTICIPANT_GENDER_MALE: 'M',
    PARTICIPANT_INTERPRETER_WELSH: 'cym',
    PARTICIPANT_ROLE_APPLICANT: 'APPL',
    CASE_PARTICIPANT_TABLE_INDIVIDUAL: 'Individual',
    CASE_PARTICIPANT_TABLE_INTERPRETER: 'Welsh',
  };

  // Edit new case
  readonly newCaseHeader = this.page.locator('h1.header-title.my-2');
  readonly hmctsCaseNumberField = this.page.locator('#matter-detail-mtrNumberAdded');
  readonly caseNameField = this.page.locator('#matter-detail-mtrAltTitleTxt');
  readonly jurisdictionField = this.page.locator('#matter-detail-mtrJsCodeId');
  readonly serviceField = this.page.locator('#matter-detail-mtrCategoryId');
  readonly caseTypeField = this.page.locator('#matter-detail-mtrMatterCdId');
  readonly regionField = this.page.locator('#matter-detail-areaCode');
  readonly clusterField = this.page.locator('#matter-detail-registry');
  readonly owningHearingField = this.page.locator('#matter-detail-homeLocationId');

  // Add new participant
  readonly caseParticipantsHeader = this.page.getByRole('heading', {
    name: 'Case Participants',
  });
  readonly addNewParticipantButton = this.page.locator('#add_new_party_btn_id');

  // Add related case
  readonly relatedCasesHeader = this.page.getByRole('heading', {name: 'Related Cases ' });
  readonly addRelatedCaseBtn =  this.page.locator('#add_mtr_matter_btn_id');
  readonly quickSearchField =  this.page.getByRole('textbox', { name: 'Quick Search'});
  readonly addRelatedCaseOkBtn = this.page.getByRole('button', {name: 'OK'});
  readonly relatedCasesTable =this.page.locator('table[aria-label="Related Cases "]')



  constructor(page: Page) {
    super(page);
  }

  async clickRelatedCaseResult(caseNumber: string) {
    await this.page.locator('.tt-suggestion', { hasText: caseNumber }).click();
  }

  async checkRelatedCaseDisplay(caseName: string) {
    await expect(
      this.relatedCasesTable.locator('td', { hasText: caseName })
    ).toBeVisible();
  }

  async createNewParticipant(
    participantClass: string,
    participantType: string,
    givenNames: string,
    lastName: string,
    gender: string,
    dateOfBirth: string,
    interpreter: string,
    role: string,
  ) {
    const waitForCreateNewPartyPopup = this.page.waitForEvent('popup');
    await this.addNewParticipantButton.click();
    const createNewParticipant = await waitForCreateNewPartyPopup;
    await expect(
      createNewParticipant.getByRole('button', {
        name: 'Create New',
        exact: true,
      }),
    ).toBeVisible();

    await createNewParticipant.getByRole('button', { name: 'Create New', exact: true }).click();

    // Fill in the participant details
    //wait for heading to be visible
    await expect
      .poll(
        async () => {
          return await createNewParticipant.getByText('New Participant').isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    //wait for Participant Class to be visible
    await expect
      .poll(
        async () => {
          return await createNewParticipant.getByLabel('Participant Class').isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await expect(createNewParticipant.getByLabel('Participant Class')).toBeVisible();
    await createNewParticipant.getByLabel('Participant Class').click();
    await createNewParticipant.getByLabel('Participant Class').selectOption(participantClass);
    await expect(createNewParticipant.getByLabel('Participant Type')).toBeVisible();
    await createNewParticipant.getByLabel('Participant Type').click();
    await createNewParticipant.getByLabel('Participant Type').selectOption(participantType);
    await createNewParticipant.getByRole('textbox', { name: 'Given Names' }).click();
    await createNewParticipant.getByRole('textbox', { name: 'Given Names' }).fill(givenNames);
    await createNewParticipant.getByRole('textbox', { name: 'Last Name' }).click();
    await createNewParticipant.getByRole('textbox', { name: 'Last Name' }).fill(lastName);
    await createNewParticipant.getByLabel('Gender', { exact: true }).selectOption(gender);
    await createNewParticipant.getByRole('textbox', { name: 'DOB' }).click();
    await createNewParticipant.getByRole('textbox', { name: 'DOB' }).fill(dateOfBirth);
    await createNewParticipant.locator('#personentityLanguageCodeIntp').click();
    await createNewParticipant.locator('#personentityLanguageCodeIntp').selectOption(interpreter);
    await createNewParticipant.getByRole('button', { name: 'Save' }).click();

    //wait for Participant Class to be visible
    await expect
      .poll(
        async () => {
          return await createNewParticipant.getByText('New Party').isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await expect(createNewParticipant.getByText('New Party')).toBeVisible();
    await expect(createNewParticipant.getByLabel('Role')).toBeVisible();
    await createNewParticipant.getByLabel('Role').selectOption(role);
    await createNewParticipant.getByRole('button', { name: 'Save', exact: true }).click();
  }

  async checkCaseParticipantTable(caseParticipantsType: string, caseParticipantsName: string, caseInterpreter: string) {
    await expect
      .poll(
        async () => {
          return await this.page.getByRole('cell', { name: caseParticipantsType }).first().isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await expect(this.page.getByRole('cell', { name: caseParticipantsType })).toBeVisible();
    await expect(this.page.getByRole('link', { name: caseParticipantsName })).toBeVisible();
    await expect(this.page.getByRole('cell', { name: caseInterpreter }).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'View/Edit' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Remove' })).toBeVisible();
  }
}
