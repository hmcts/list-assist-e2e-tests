import { Page } from "@playwright/test";
import { Base } from "../base";
import { SidebarComponent } from "../components";

export class HomePage extends Base {
  readonly container = this.page.locator(".bodycontent");
  readonly sidebarComponent = new SidebarComponent(this.container);

  constructor(page: Page) {
    super(page);
  }
}
