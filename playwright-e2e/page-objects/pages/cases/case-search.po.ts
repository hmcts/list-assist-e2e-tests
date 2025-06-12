import { Page, expect } from "@playwright/test";
import { Base } from "../../base";

export class CaseSearchPage extends Base {
  readonly caseSearchPageHeader = this.page.locator("#CMSHomeHeading");
  readonly caseNumber = this.page.locator("#mtrMediumTitle");
  readonly searchButton = this.page.locator("#submitButton");
  readonly addToCartButton = this.page.locator("#header-bar-add-to-cart-icon");

  constructor(page: Page) {
    super(page);
  }

  async searchCase(caseNumber: string): Promise<void> {
    await this.caseNumber.fill(caseNumber);

    await expect
      .poll(
        async () => {
          await this.searchButton.click();
          // Wait for the addToCartButton
          try {
            await this.addToCartButton.waitFor({
              state: "visible",
              timeout: 5000,
            });
            return true;
          } catch {
            return false;
          }
        },
        {
          intervals: [1000],
          timeout: 60000,
        },
      )
      .toBe(true);

    await expect(this.addToCartButton).toBeVisible();
  }
}
