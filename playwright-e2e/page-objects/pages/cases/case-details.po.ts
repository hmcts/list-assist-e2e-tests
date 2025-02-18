import { Page } from "@playwright/test";
import { Base } from "../../base";

export class CaseDetailsPage extends Base {
  readonly container = this.page.locator("#pageContent");
  readonly addToCartButton = this.page.getByLabel("Add to cart");
  readonly openListingDetails = this.page.getByRole("link", {
    name: "Open listing details",
  });

  constructor(page: Page) {
    super(page);
  }
}
