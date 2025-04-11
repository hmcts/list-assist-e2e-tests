import { Page, expect } from "@playwright/test";
import { Base } from "../../base";

export class NewParticipantPage extends Base {
  readonly givenNameInput = this.page.getByRole("textbox", {
    name: "Given Names",
  });
  readonly lastNameInput = this.page.getByRole("textbox", {
    name: "Last Name",
  });
  readonly interpreterInput = this.page.locator(
    "#personentityLanguageCodeIntp",
  );
  readonly saveButton = this.page.getByRole("button", { name: "Save" });

  constructor(page: Page) {
    super(page);
  }

  //edit participant header (to be moved when edit participant page test is created)
  readonly editParticipantHeader = this.page.getByText('Edit Participant', { exact: true })

  readonly CONSTANTS = {
    CASE_PARTICIPANT_TABLE_INTERPRETER_CYM: "Welsh",
  };

  async populateNewParticipantFormWithMandatoryData(
    givenName: string,
    lastName: string,
    interpreter: string
  ) {
    await this.givenNameInput.fill(givenName);
    await this.lastNameInput.fill(lastName);

    await this.interpreterInput.click();
    await this.interpreterInput.selectOption(interpreter
    );

    await this.saveButton.click();
  }

  async checkEditParticipantHeader() {
    await expect
      .poll(
        async () => {
          return await this.editParticipantHeader.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();
  }
}
