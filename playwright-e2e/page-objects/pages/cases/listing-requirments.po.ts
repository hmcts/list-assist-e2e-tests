import { Page } from "@playwright/test";
import { Base } from "../../base";

export class ListingRequirementsPage extends Base {
  readonly multidayHearingDaysTextBox = this.page.locator("#multidayHearing");

  readonly CONSTANTS = {
    PARENT_HEARING_CHANNEL_IN_PERSON: "In Person (parent)",
    PARENT_HEARING_CHANNEL_TELEPHONE: "Telephone",
    PARENT_HEARING_CHANNEL_VIDEO: "Video",
  };

  readonly parentHearingChannel = this.page
    .locator("span")
    .filter({ hasText: "In Person (parent) Not" })
    .getByRole("button");
  readonly participantMethodsLocator = this.page.locator(
    "table.table-bordered >> tr:not(:first-child) td:nth-child(4) select.form-control",
  );

  readonly hearingChannelLocator = this.page.locator("#evtHearingMethodCd");

  async getSelectedHearingMethods(): Promise<string[]> {
    return await this.hearingChannelLocator.evaluate(
      (select: HTMLSelectElement) =>
        Array.from(select.selectedOptions).map((option) => option.value),
    );
  }

  async getHearingMethodValueAt(index: number): Promise<string> {
    return await this.participantMethodsLocator
      .nth(index)
      .evaluate((el: HTMLSelectElement) => el.value);
  }

  async assertHearingMethodValueAt(
    index: number,
    expectedValue: string,
  ): Promise<void> {
    const actualValue = await this.getHearingMethodValueAt(index);
    if (actualValue !== expectedValue) {
      throw new Error(
        `Expected value at row ${
          index + 1
        } to be "${expectedValue}", but got "${actualValue}"`,
      );
    }
  }

  constructor(page: Page) {
    super(page);
  }

  async setHearingChannel(hearingChannel: string): Promise<void> {
    await this.page.getByRole("checkbox", { name: hearingChannel }).check();
  }
}
