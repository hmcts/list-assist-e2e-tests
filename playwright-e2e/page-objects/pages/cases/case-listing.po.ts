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

  //scheduling
  readonly scheduleButton10amTo6pmReleased = this.page.getByRole("button", {
    name: "10:00-16:00 - Released",
  });
  readonly scheduleButton10amTo6pmLeicester = this.page.getByRole("button", {
    name: "10:00-16:00 - Leicester",
  });
  readonly goToSessionDetailsButton = this.page.getByRole("button", {
    name: "Go to Session Details screen",
  });
  readonly deleteSessionButton = this.page.getByRole("button", {
    name: "Delete",
  });
  readonly deleteSessionInSessionDetailsButton = this.page
    .locator("#handleListingImgId")
    .nth(1);

  //listing iframe
  readonly listingHearingDropdown = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole("button", { name: "Please Choose..." });
  readonly listingHearingApplicationSelect = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole("list")
    .getByRole("option", {
      name: "Application",
      exact: true,
    });
  readonly listingIframeSaveButton = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole("button", {
      name: "Save",
      exact: true,
    });

  async checkingListingIframe() {
    const listingIframe = this.page.locator('iframe[name="addAssociation"]');
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
    } else {
      console.log("Cart is empty. No action needed");
    }
  }

  async clearDownSchedule(cancellationCode: string) {
    if (await this.scheduleButton10amTo6pmLeicester.isVisible()) {
      await this.scheduleButton10amTo6pmLeicester.click();
      await this.goToSessionDetailsButton.click();
      await this.page.waitForTimeout(1000);

      //delete session from inside of session details page, if available
      if (await this.deleteSessionInSessionDetailsButton.isVisible()) {
        await this.deleteSessionInSessionDetailsButton.click();
        await this.page.locator("#cancellationCode").click();
        await this.page
          .locator("#cancellationCode")
          .selectOption(cancellationCode);
        await this.page.getByRole("button", { name: "Yes" }).click();
        await this.page.waitForTimeout(3000);
      }

      await this.deleteSessionButton.click();
      await this.page.waitForTimeout(5000);
    } else {
      console.log("No sessions to be cleared. No action needed");
    }
  }
}
