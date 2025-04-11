import { Locator, Page } from "@playwright/test";

export class UpperbarComponent {
  readonly loginButton = this.root.locator("#logout");
  readonly closeCaseButton = this.root.locator("#closeApplication");
  readonly closeParticipantButton = this.root.locator("#closeEntity");

  constructor(
    private root: Locator,
    private page: Page,
  ) {}
}
