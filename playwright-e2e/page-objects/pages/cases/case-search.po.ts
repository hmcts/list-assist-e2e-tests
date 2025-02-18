import { Page } from "@playwright/test";
import { Base } from "../../base";

export class CaseSearchPage extends Base {
  readonly container = this.page.locator("#pageContent");
  readonly caseNumber = this.page.locator("#mtrMediumTitle");
  readonly searchButton = this.page.locator("#submitButton");
  readonly resultsTable = this.page.locator("#matterSearchResultGrid");

  constructor(page: Page) {
    super(page);
  }

  async searchCase(caseNumber: string): Promise<void> {
    await this.caseNumber.fill(caseNumber);
    await this.searchButton.click();
  }
}
