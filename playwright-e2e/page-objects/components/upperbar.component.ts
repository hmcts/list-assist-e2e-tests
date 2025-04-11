import { Locator, Page } from "@playwright/test";
import { expect } from "../../fixtures.ts";

export class UpperbarComponent {
  readonly loginButton = this.root.locator("#logout");
  readonly closeCaseButton = this.root.locator("#closeApplication");
  readonly closeParticipantButton = this.root.locator("#closeEntity");

  constructor(
    private root: Locator,
    private page: Page,
  ) {}
}
