import { Locator, Page, expect } from "@playwright/test";
import { Base } from "../../base";

export class EditNewCasePage extends Base {
  readonly CONSTANTS = {
    //add participant
    PARTICIPANT_CLASS_PERSON: "PERSON",
    PARTICIPANT_TYPE_INDIVIDUAL: "IND",
    PARTICIPANT_GENDER_MALE: "M",
    PARTICIPANT_INTERPRETER_WELSH: "cym",
    PARTICIPANT_ROLE_APPLICANT: "APPL",
    CASE_PARTICIPANT_TABLE_INDIVIDUAL: "Individual",
    CASE_PARTICIPANT_TABLE_INTERPRETER: "Welsh",
  };

  // Edit new case
  readonly newCaseHeader = this.page.locator("h1.header-title.my-2");
  readonly hmctsCaseNumberField = this.page.locator(
    "#matter-detail-mtrNumberAdded",
  );
  readonly caseNameField = this.page.locator(
    "#matter-detail-mtrAltTitleTxt .col-6:nth-of-type(2)",
  );
  readonly jurisdictionField = this.page.locator("#matter-detail-mtrJsCodeId");
  readonly serviceField = this.page.locator("#matter-detail-mtrCategoryId");
  readonly caseTypeField = this.page.locator("#matter-detail-mtrMatterCdId");
  readonly regionField = this.page.locator("#matter-detail-areaCode");
  readonly clusterField = this.page.locator("#matter-detail-registry");
  readonly owningHearingField = this.page.locator(
    "#matter-detail-homeLocationId",
  );
  // Edit case pencil icon
  readonly editCasePencilIcon = this.page.locator("#editMatter");
  readonly caseNameSuppressionField = this.page.locator("#CaseNameSuppression");
  // Add new participant
  readonly caseParticipantsHeader = this.page.getByRole("heading", {
    name: "Case Participants",
  });
  readonly addNewParticipantButton = this.page.locator("#add_new_party_btn_id");

  // Add related case
  readonly relatedCasesHeader = this.page.getByRole("heading", {
    name: "Related Cases ",
  });
  readonly addRelatedCaseBtn = this.page.locator("#add_mtr_matter_btn_id");
  readonly quickSearchField = this.page.getByRole("textbox", {
    name: "Quick Search",
  });
  readonly addRelatedCaseOkBtn = this.page.getByRole("button", { name: "OK" });
  readonly relatedCasesTable = this.page.locator(
    'table[aria-label="Related Cases "]',
  );

  // Edit case save button
  readonly editCaseSaveButton = this.page.locator("#saveButton");

  constructor(page: Page) {
    super(page);
  }

  async selectOptionWithRetry(
    selectLocator: Locator,
    optionValue: string,
    fieldName: string,
  ): Promise<void> {
    await expect(selectLocator, `${fieldName} should be enabled`).toBeEnabled();

    await expect
      .poll(
        async () => {
          return await selectLocator
            .evaluate((el, expected) => {
              const select = el as HTMLSelectElement;
              return Array.from(select.options).some(
                (option) => option.value === expected,
              );
            }, optionValue)
            .catch(() => false);
        },
        {
          intervals: [500, 1_000, 2_000],
          timeout: 20_000,
        },
      )
      .toBeTruthy();

    for (let attempt = 0; attempt < 3; attempt++) {
      await selectLocator.selectOption(optionValue).catch(() => undefined);

      const selectedValue = await selectLocator.inputValue().catch(() => "");

      if (selectedValue === optionValue) {
        return;
      }

      await expect(selectLocator).toBeEnabled();
    }

    throw new Error(
      `Unable to select value '${optionValue}' for ${fieldName} after retries`,
    );
  }

  async clickRelatedCaseResult(caseNumber: string) {
    await this.page.locator(".tt-suggestion", { hasText: caseNumber }).click();
  }

  async checkRelatedCaseDisplay(caseName: string) {
    await expect(
      this.relatedCasesTable.locator("td", { hasText: caseName }),
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
    selectRoleIfExists: boolean = false,
    alternativePartyName?: string,
  ) {
    await expect(this.addNewParticipantButton).toBeVisible();
    await expect(this.addNewParticipantButton).toBeEnabled();
    await this.addNewParticipantButton.scrollIntoViewIfNeeded();
    await this.addNewParticipantButton.click({ trial: true });

    // Reuse an already-open participant popup when present (supports flows that pre-click Add New Participant).
    let createNewParticipant: Page | null = null;

    const contextPages = this.page.context().pages();
    const maybeExistingPopup = contextPages[contextPages.length - 1];
    if (maybeExistingPopup && maybeExistingPopup !== this.page) {
      const hasCreateNewButton = await maybeExistingPopup
        .getByRole("button", {
          name: "Create New",
          exact: true,
        })
        .isVisible()
        .catch(() => false);

      if (hasCreateNewButton) {
        createNewParticipant = maybeExistingPopup;
      }
    }

    // Popup can be delayed/intermittent depending on browser timing, so retry click + wait for popup.
    for (let attempt = 0; attempt < 5; attempt++) {
      if (createNewParticipant) {
        break;
      }

      const popupPromise = this.page
        .waitForEvent("popup", { timeout: 10_000 })
        .catch(() => null);
      await this.addNewParticipantButton.click();
      createNewParticipant = await popupPromise;

      if (createNewParticipant) {
        break;
      }
    }

    if (!createNewParticipant) {
      throw new Error("Participant popup failed to open after retries");
    }

    await expect(
      createNewParticipant.getByRole("button", {
        name: "Create New",
        exact: true,
      }),
    ).toBeVisible();

    await createNewParticipant
      .getByRole("button", { name: "Create New", exact: true })
      .click();

    // Fill in the participant details
    //wait for heading to be visible
    await expect
      .poll(
        async () => {
          return await createNewParticipant
            .getByText("New Participant")
            .isVisible();
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
          return await createNewParticipant
            .getByLabel("Participant Class")
            .isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    const participantClassSelect =
      createNewParticipant.getByLabel("Participant Class");
    const participantTypeSelect =
      createNewParticipant.getByLabel("Participant Type");
    const genderSelect = createNewParticipant.getByLabel("Gender", {
      exact: true,
    });
    const interpreterSelect = createNewParticipant.locator(
      "#personentityLanguageCodeIntp",
    );

    await this.selectOptionWithRetry(
      participantClassSelect,
      participantClass,
      "Participant Class",
    );

    // Wait for form to re-render with Person's Details section
    await expect(
      createNewParticipant.getByText("Person's Details"),
    ).toBeVisible();

    await this.selectOptionWithRetry(
      participantTypeSelect,
      participantType,
      "Participant Type",
    );

    // Fill all text fields
    await createNewParticipant
      .getByRole("textbox", { name: "Given Names" })
      .fill(givenNames);
    await createNewParticipant
      .getByRole("textbox", { name: "Last Name" })
      .fill(lastName);

    await this.selectOptionWithRetry(genderSelect, gender, "Gender");

    // Fill DOB
    await createNewParticipant
      .getByRole("textbox", { name: "DOB" })
      .fill(dateOfBirth);

    await this.selectOptionWithRetry(
      interpreterSelect,
      interpreter,
      "Interpreter Language",
    );

    const participantSaveButton = createNewParticipant.getByRole("button", {
      name: "Save",
      exact: true,
    });
    await expect(participantSaveButton).toBeEnabled();
    await participantSaveButton.click({ trial: true });

    const newPartyHeading = createNewParticipant.getByText("New Party");
    const newParticipantHeading =
      createNewParticipant.getByText("New Participant");
    const roleSelect = createNewParticipant.getByLabel("Role");

    let transitionedToPartyStep = false;
    let popupClosedAfterInitialSave = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      await participantSaveButton.click();

      if (createNewParticipant.isClosed()) {
        popupClosedAfterInitialSave = true;
        transitionedToPartyStep = true;
        break;
      }

      const ignoreAndContinueButton = createNewParticipant.getByRole("button", {
        name: /Ignore\s*&\s*Continue/i,
      });

      const ignoreVisible = await ignoreAndContinueButton
        .waitFor({ state: "visible", timeout: 2_000 })
        .then(() => true)
        .catch(() => false);

      if (ignoreVisible) {
        await ignoreAndContinueButton.click();
      }

      const roleVisible = await roleSelect.isVisible().catch(() => false);
      if (roleVisible) {
        transitionedToPartyStep = true;
        break;
      }

      transitionedToPartyStep = await newPartyHeading
        .waitFor({ state: "visible", timeout: 12_000 })
        .then(() => true)
        .catch(() => false);

      if (transitionedToPartyStep) {
        break;
      }

      const stillOnNewParticipant = await newParticipantHeading
        .isVisible()
        .catch(() => false);
      if (!stillOnNewParticipant) {
        break;
      }

      await expect(participantSaveButton).toBeEnabled();
      await participantSaveButton.click({ trial: true });
    }

    if (!transitionedToPartyStep) {
      throw new Error("Participant Save did not transition to New Party");
    }

    if (popupClosedAfterInitialSave) {
      return;
    }

    await expect(roleSelect).toBeVisible();
    await this.selectOptionWithRetry(roleSelect, role, "Role");

    if (selectRoleIfExists) {
      await createNewParticipant.locator("#mpSupressFlag1").click();
    } else if (alternativePartyName && selectRoleIfExists) {
      await createNewParticipant
        .locator("#mpSuppressAltNameId")
        .fill(alternativePartyName);
    }
    const finalSaveButton = createNewParticipant.getByRole("button", {
      name: "Save",
      exact: true,
    });
    await expect(finalSaveButton).toBeEnabled();

    let popupClosed = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const popupClosePromise = createNewParticipant
        .waitForEvent("close", { timeout: 8_000 })
        .then(() => true)
        .catch(() => false);

      await finalSaveButton.click();
      popupClosed = await popupClosePromise;

      if (popupClosed) {
        break;
      }
    }

    if (!popupClosed) {
      throw new Error("Participant popup did not close after final Save");
    }
  }

  async checkCaseParticipantTable(
    caseParticipantsType: string,
    caseParticipantsName: string,
    caseInterpreter: string,
  ) {
    const escapedParticipantName = caseParticipantsName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const participantNameLink = this.page
      .locator("a", {
        hasText: new RegExp(`^\\s*${escapedParticipantName}\\s*$`, "i"),
      })
      .first();

    await expect
      .poll(
        async () => {
          return await participantNameLink.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    const participantRow = this.page
      .locator("table tbody tr")
      .filter({ has: participantNameLink })
      .first();

    await expect(participantRow).toBeVisible();

    await expect(participantRow).toContainText(caseParticipantsType);
    await expect(participantNameLink).toBeVisible();
    await expect(participantRow).toContainText(
      new RegExp(caseInterpreter, "i"),
    );
    await expect(
      participantRow.getByRole("button", { name: "View/Edit" }),
    ).toBeVisible();
    await expect(
      participantRow.getByRole("button", { name: "Remove" }),
    ).toBeVisible();
  }

  async setCaseNameSuppression(caseNameSuppression) {
    await this.editCasePencilIcon.click();
    await this.caseNameSuppressionField.fill(caseNameSuppression);
    await this.editCaseSaveButton.click();
  }
}
