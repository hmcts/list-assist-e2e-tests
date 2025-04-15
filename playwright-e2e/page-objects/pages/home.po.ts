import { Page, expect } from '@playwright/test';
import { Base } from '../base';

export class HomePage extends Base {
  readonly container = this.page.locator('.bodycontent');
  readonly homePage = this.page.locator('#home-page');

  constructor(page: Page) {
    super(page);
  }

  async waitForHomePageLoad(): Promise<void> {
    await expect
      .poll(
        async () => {
          return await this.homePage.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();
  }
}
