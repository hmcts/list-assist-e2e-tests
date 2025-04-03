import { Page, expect } from "@playwright/test";
import { Base } from "../../base";

export class ListACase extends Base {
  readonly cartCounterLabel = this.page.locator(".cart-counter-label");
  readonly cartButton = this.page.getByRole("button", { name: "Case Cart" });
  readonly emptyCartButton = this.page.getByRole("button", {
    name: "Empty Cart",
  });
  readonly sessionBookingHeader = this.page.getByText('Session Booking', { exact: true });

  async emptyCaseCart() {
    if (await this.cartButton.isEnabled()) {
      await this.cartButton.click();
      await this.emptyCartButton.click();
      const modal = this.page.locator(".modal-content");
      await modal.getByRole("button", { name: "Yes" }).click();
      await expect(this.cartCounterLabel).toBeHidden();
    } else {
      console.log("Cart is empty, no action needed");
    }
  }
}
