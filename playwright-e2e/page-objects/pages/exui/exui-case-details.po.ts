import { Page } from "@playwright/test";
import { Base } from "../../base";
import { ExuiCaseDetailsComponent } from "../../components/";

export class ExuiCaseDetailsPage extends Base {
  readonly container = this.page.locator("exui-case-details-home");
  readonly exuiCaseDetailsComponent = new ExuiCaseDetailsComponent(
    this.page,
    this.container
  );

  constructor(page: Page) {
    super(page);
  }
}
