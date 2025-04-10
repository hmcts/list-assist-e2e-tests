import { Page } from "@playwright/test";
import { Base } from "../base";

export class HomePage extends Base {
  readonly container = this.page.locator(".bodycontent");
  readonly header = this.page.locator("h1.header-title");

  constructor(page: Page) {
    super(page);
  }
}
