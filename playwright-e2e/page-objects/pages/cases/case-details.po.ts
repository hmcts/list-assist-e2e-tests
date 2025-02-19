import { expect, Page } from "@playwright/test";
import { Base } from "../../base";

export class CaseDetailsPage extends Base {
  readonly container = this.page.locator("#pageContent");
  readonly addToCartButton = this.page.getByLabel("Add to cart");
  readonly additionalDetailsCard = this.page.locator(
    "#matter-detail-summaryFields"
  );
  readonly openListingDetails = this.page.getByRole("link", {
    name: "Open listing details",
  });

  constructor(page: Page) {
    super(page);
  }

  async waitForLoad(): Promise<void> {
    await expect
      .poll(
        async () => {
          return await this.additionalDetailsCard.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        }
      )
      .toBeTruthy();
  }

  async isCaseListed(): Promise<boolean> {
    await this.waitForLoad();
    return await this.openListingDetails.isVisible();
  }
}
