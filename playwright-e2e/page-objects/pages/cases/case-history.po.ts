import { Page } from "@playwright/test";
import { Base } from "../../base";

export class CaseHistoryPage extends Base {
  readonly caseHistoryHeader = this.page.locator("#CMSHomeHeading");

  constructor(page: Page) {
    super(page);
  }
}
