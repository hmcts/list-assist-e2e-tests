import { Locator, Page, expect } from "@playwright/test";
import { Base } from "../../base";

export class EditNewCasePage extends Base {
  readonly CONSTANTS = {
    //add participant
    PARTICIPANT_CLASS_PERSON: "PERSON",
    PARTICIPANT_CLASS_ORGANISATION: "ORG",
    PARTICIPANT_TYPE_INDIVIDUAL: "IND",
    PARTICIPANT_TYPE_ORGANISATION: "ORG",
    PARTICIPANT_GENDER_MALE: "M",
    PARTICIPANT_INTERPRETER_WELSH: "cym",
    PARTICIPANT_ROLE_APPLICANT: "APPL",
    PARTICIPANT_ROLE_CLAIMANT: "CLAI",
    PARTICIPANT_ROLE_DEFENDANT: "DEFE",
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

  async selectOptionWithRuntimeFallback(
    selectLocator: Locator,
    optionValue: string,
    fieldName: string,
  ): Promise<void> {
    try {
      await this.selectOptionWithRetry(selectLocator, optionValue, fieldName);
    } catch {
      // Fallback for flaky render timing: force-set the runtime value when present.
      await selectLocator
        .evaluate((el, expected) => {
          const select = el as HTMLSelectElement;
          select.value = expected;
          select.dispatchEvent(new Event("input", { bubbles: true }));
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }, optionValue)
        .catch(() => undefined);
    }

    const selectedValue = await selectLocator.inputValue().catch(() => "");
    if (selectedValue === optionValue) {
      return;
    }

    await selectLocator
      .evaluate((el, expected) => {
        const select = el as HTMLSelectElement;
        const hasExpected = Array.from(select.options).some(
          (option) => option.value === expected,
        );
        if (hasExpected) {
          select.value = expected;
          select.dispatchEvent(new Event("input", { bubbles: true }));
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, optionValue)
      .catch(() => undefined);

    await expect
      .poll(
        async () => {
          return await selectLocator.inputValue().catch(() => "");
        },
        {
          intervals: [500, 1_000],
          timeout: 8_000,
        },
      )
      .toBe(optionValue);
  }

  async clickRelatedCaseResult(caseNumber: string) {
    await this.page.locator(".tt-suggestion", { hasText: caseNumber }).click();
  }

  async checkRelatedCaseDisplay(caseName: string) {
    await expect(
      this.relatedCasesTable.locator("td", { hasText: caseName }),
    ).toBeVisible();
  }

  async dismissRelatedCaseDialogIfOpen(): Promise<void> {
    const cancelRelatedCaseButton = this.page.locator("#button_cancel_btn_id");
    const cancelVisible = await cancelRelatedCaseButton
      .isVisible()
      .catch(() => false);

    if (!cancelVisible) {
      return;
    }

    await cancelRelatedCaseButton.click();
    await expect(cancelRelatedCaseButton).toBeHidden({ timeout: 5_000 });
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
    organisationName?: string,
  ) {
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

    await expect(this.addNewParticipantButton).toBeVisible();
    await expect(this.addNewParticipantButton).toBeEnabled();
    await this.addNewParticipantButton.scrollIntoViewIfNeeded();
    for (let attempt = 0; attempt < 5; attempt++) {
      if (createNewParticipant) {
        break;
      }

      await this.dismissRelatedCaseDialogIfOpen();

      const popupPromise = this.page
        .waitForEvent("popup", { timeout: 10_000 })
        .catch(() => null);
      await this.addNewParticipantButton.click();
      await this.dismissRelatedCaseDialogIfOpen();
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

    // Select Participant Class - use value directly without click
    await expect(participantClassSelect).toBeEnabled();
    await participantClassSelect.selectOption(participantClass);

    const isOrganisationParticipant =
      participantClass === this.CONSTANTS.PARTICIPANT_CLASS_ORGANISATION;
    const resolvedParticipantType = isOrganisationParticipant
      ? this.CONSTANTS.PARTICIPANT_TYPE_ORGANISATION
      : participantType;

    // Wait for form to re-render with Person's Details section
    await this.page.waitForTimeout(500);

    // Select Participant Type
    await expect(participantTypeSelect).toBeEnabled();
    await participantTypeSelect.selectOption(resolvedParticipantType);

    if (isOrganisationParticipant) {
      const orgNameToUse =
        organisationName?.trim() ||
        `${givenNames || ""} ${lastName || ""}`.trim();

      if (!orgNameToUse) {
        throw new Error("Organisation participant requires a name");
      }

      await createNewParticipant
        .locator("#organisation\\.orgName")
        .fill(orgNameToUse);
    } else {
      await expect(
        createNewParticipant.getByText("Person's Details"),
      ).toBeVisible();

      // Fill all text fields
      await createNewParticipant
        .getByRole("textbox", { name: "Given Names" })
        .fill(givenNames);
      await createNewParticipant
        .getByRole("textbox", { name: "Last Name" })
        .fill(lastName);

      // Select Gender
      await expect(genderSelect).toBeEnabled();
      await genderSelect.selectOption(gender);

      // Fill DOB
      await createNewParticipant
        .getByRole("textbox", { name: "DOB" })
        .fill(dateOfBirth);

      // Select Interpreter Language
      await expect(interpreterSelect).toBeEnabled();
      await interpreterSelect.selectOption(interpreter);
    }

    const saveButton = createNewParticipant.getByRole("button", {
      name: "Save",
      exact: true,
    });

    await expect(saveButton).toBeVisible({ timeout: 5_000 });
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
    await saveButton.click({ timeout: 5_000 }).catch(async () => {
      await saveButton.click({ timeout: 5_000 });
    });

    const newPartyHeading = createNewParticipant.getByText("New Party");
    const roleSelect = createNewParticipant.getByLabel("Role");
    const ignoreAndContinueButton = createNewParticipant.getByRole("button", {
      name: /Ignore\s*&\s*Continue/i,
    });

    const waitForPartyStepOrIgnore = async (timeoutMs: number) => {
      const startedAt = Date.now();

      while (Date.now() - startedAt < timeoutMs) {
        if (createNewParticipant.isClosed()) {
          return "closed" as const;
        }

        const ignoreVisible = await ignoreAndContinueButton
          .isVisible()
          .catch(() => false);
        if (ignoreVisible) {
          await ignoreAndContinueButton
            .click({ timeout: 3_000 })
            .catch(() => undefined);
        }

        const roleVisible = await roleSelect.isVisible().catch(() => false);
        if (roleVisible) {
          return "party" as const;
        }

        const partyHeadingVisible = await newPartyHeading
          .isVisible()
          .catch(() => false);
        if (partyHeadingVisible) {
          return "party" as const;
        }

        await this.page.waitForTimeout(500);
      }

      return "timeout" as const;
    };

    let partyStepResult = await waitForPartyStepOrIgnore(8_000);
    if (partyStepResult === "timeout") {
      await expect(saveButton).toBeVisible({ timeout: 3_000 });
      await expect(saveButton).toBeEnabled({ timeout: 3_000 });
      await saveButton.click({ timeout: 3_000 }).catch(async () => {
        await saveButton.click({ timeout: 3_000 });
      });
      partyStepResult = await waitForPartyStepOrIgnore(8_000);
    }

    if (partyStepResult === "closed") {
      return;
    }

    if (partyStepResult !== "party") {
      throw new Error("Participant Save did not transition to New Party");
    }

    await expect(roleSelect).toBeVisible({ timeout: 3_000 });
    await roleSelect.selectOption(role);

    if (selectRoleIfExists) {
      await createNewParticipant.locator("#mpSupressFlag1").click();
    } else if (alternativePartyName && selectRoleIfExists) {
      await createNewParticipant
        .locator("#mpSuppressAltNameId")
        .fill(alternativePartyName);
    }
    await expect(saveButton).toBeVisible({ timeout: 5_000 });
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
    const popupClosePromise = createNewParticipant.waitForEvent("close", {
      timeout: 8_000,
    });
    const mainPageReadyPromise = this.caseParticipantsHeader.waitFor({
      state: "visible",
      timeout: 8_000,
    });

    await saveButton.click({ timeout: 5_000 }).catch(async () => {
      await saveButton.click({ timeout: 5_000 });
    });

    const finalSaveSignal = await Promise.any([
      popupClosePromise.then(() => "popupClosed"),
      mainPageReadyPromise.then(() => "mainPageReady"),
    ]).catch(() => null);

    if (!finalSaveSignal) {
      throw new Error(
        "Participant final Save did not complete via popup close or main page readiness",
      );
    }
  }

  async checkCaseParticipantTable(
    caseParticipantsType: string,
    caseParticipantsName: string,
    caseInterpreter: string,
  ) {
    const participantRow = this.page
      .locator("table tbody tr")
      .filter({
        hasText: new RegExp(
          caseParticipantsName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i",
        ),
      })
      .first();

    await expect
      .poll(
        async () => {
          const rowText = (await participantRow.textContent()) || "";
          return rowText
            .toLowerCase()
            .includes(caseParticipantsName.toLowerCase());
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await expect(participantRow).toBeVisible();

    await expect(participantRow).toContainText(caseParticipantsType);
    await expect(participantRow).toContainText(
      new RegExp(caseParticipantsName, "i"),
    );
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
