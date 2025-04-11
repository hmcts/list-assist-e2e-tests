import { Page } from "@playwright/test";
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

  readonly CONSTANTS = {
    CASE_PARTICIPANT_TABLE_INTERPRETER: "Welsh",
  };

  async populateNewParticipantFormWithMandatoryData(
    givenName: string,
    lastName: string,
  ) {
    await this.givenNameInput.fill(givenName);
    await this.lastNameInput.fill(lastName);

    await this.interpreterInput.click();
    await this.interpreterInput.selectOption(
      this.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
    );

    await this.saveButton.click();
  }
}
