import { expect, Page } from "@playwright/test";
import { Base } from "../../base";

export class BookSessionPage extends Base {
  readonly container = this.page.locator("#pageContent");
  readonly heading = this.page.getByText("Session Booking", { exact: true });
  readonly listingDuration = this.page.locator("#defListingDuration");
  readonly saveButton = this.page.locator("#svb");
  readonly deleteButton = this.page.locator("#dvb");
  readonly popupFrame = this.page.frameLocator(
    "#container iframe[name='addAssociation']"
  );
  readonly popup = {
    form: this.popupFrame.locator("#listingPopupForm"),
    saveButton: this.popupFrame.locator("#saveListingBtn"),
    cancelButton: this.popupFrame.locator("#cancelListingBtn"),
    hearingType: this.popupFrame.locator("#hearingType"),
  };
  readonly cancelListingButton = this.page
    .locator("#handleListingImgId")
    .last();
  readonly cancelPopup = {
    popup: this.page.locator("#vbCancelReasonsLov"),
    cancelDropdown: this.page.locator("#cancellationCode"),
  };
  readonly confirmPopup = {
    confirmButton: this.page.locator(".modal-content #ok-btn"),
  };

  constructor(page: Page) {
    super(page);
  }

  async bookSession(duration: string, hearingType: string) {
    await this.waitForLoad();
    await this.listingDuration.selectOption(duration);
    await this.saveButton.click();
    await this.waitForFrame();
    await this.popup.hearingType.selectOption(hearingType);
    await this.popup.saveButton.click();
  }

  async cancelSession(cancelReason: string) {
    await this.waitForLoad();
    await this.popup.cancelButton.click();
    await this.cancelListingButton.click();
    await expect(this.cancelPopup.popup).toBeVisible();
    await this.cancelPopup.cancelDropdown.selectOption(cancelReason);
    await expect(this.confirmPopup.confirmButton).toBeVisible();
    await this.confirmPopup.confirmButton.click();
    await this.deleteButton.click();
  }

  async waitForFrame() {
    await expect
      .poll(
        async () => {
          return await this.popup.form.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        }
      )
      .toBeTruthy();
  }

  async waitForLoad() {
    await expect
      .poll(
        async () => {
          return await this.listingDuration.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        }
      )
      .toBeTruthy();
  }
}
