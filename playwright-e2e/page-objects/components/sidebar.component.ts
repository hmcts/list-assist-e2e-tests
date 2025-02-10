import { Locator } from "@playwright/test";

export class SidebarComponent {
  readonly sidebar = this.root.locator("#pageNavigation");

  constructor(private root: Locator) {}
}
