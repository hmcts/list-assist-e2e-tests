import { Page } from "@playwright/test";
import { Base } from "../base";

export class HomePage extends Base {
  readonly container = this.page.locator(".bodycontent");

  constructor(page: Page) {
    super(page);
  }
}
