import { expect } from "@playwright/test";
import { Base } from "../../base";

export class CaseListingPage extends Base {
  readonly cartCounterLabel = this.page.locator(".cart-counter-label");
  readonly cartButton = this.page.getByRole("button", { name: "Case Cart" });
  readonly emptyCartButton = this.page.getByRole("button", {
    name: "Empty Cart",
  });
  readonly sessionBookingHeader = this.page.getByText("Session Booking", {
    exact: true,
  });
  readonly sessionStatusDropdown = this.page.getByLabel(
    "Session Status: This field is",
  );
  readonly durationDropdown = this.page.getByLabel(
    "Default Listing Duration (",
  );
  readonly saveButton = this.page.getByRole("button", { name: "Save" });
  readonly bookingDetailsButtons = this.page.locator(
    'button[title="Show booking details"]',
  );
  readonly confirmListingReleasedStatus = this.page.getByRole('button', { name: '10:00-16:00 - Released' }).nth(1);

  async checkingListingIframe() {
    const listingIframe = this.page.locator('iframe[name="addAssociation"]');

    await this.page.waitForTimeout(2000);

    await expect(
      listingIframe
        .contentFrame()
        .getByRole("button", { name: "Please Choose..." }),
    ).toBeVisible();
    await listingIframe
      .contentFrame()
      .getByRole("button", { name: "Please Choose..." })
      .click();
    await listingIframe
      .contentFrame()
      .getByRole("list")
      .getByRole("option", { name: "Allocation Hearing", exact: true })
      .click();
    await listingIframe
      .contentFrame()
      .getByRole("button", { name: "Save", exact: true })
      .click();
  }

  async emptyCaseCart() {
    if (await this.cartButton.isEnabled()) {
      await this.cartButton.click();
      await this.emptyCartButton.click();
      const modal = this.page.locator(".modal-content");
      await modal.getByRole("button", { name: "Yes" }).click();
      await expect(this.cartCounterLabel).toBeHidden();
      await this.sidebarComponent.backToMenuButton.click();

      console.log("Cart has been emptied");
    } else {
      console.log("Cart is empty. No action needed");
    }
  }
}
