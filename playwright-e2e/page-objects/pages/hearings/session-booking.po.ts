import {expect, Page} from '@playwright/test';
import { Base } from '../../base';

export class SessionBookingPage extends Base {
  readonly CONSTANTS = {
    //case listing
    CASE_LISTING_ROOM_NAME_LEICESTER_CC_7: 'Leicester County Courtroom 07',
    CASE_LISTING_SESSION_STATUS_TYPE_RELEASED: '5',
    CASE_LISTING_SESSION_STATUS_TYPE_APPROVED: '4',
    CASE_LISTING_SESSION_DURATION_1_00: '60',
    CASE_LISTING_COLUMN_ONE: 'columnOne',
    CASE_LISTING_HEARING_TYPE_APPLICATION: 'Application',
    CASE_LISTING_CANCEL_REASON_AMEND: 'Amend',

    //session details
    SESSION_DETAILS_CANCELLATION_CODE_CANCEL: 'CNCL',
    //session hearing channels
    SESSION_HEARING_CHANNEL_IN_PERSON: 'In Person (child)',
    SESSION_HEARING_CHANNEL_TELEPHONE: 'Telephone - Other',

    CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON: 'Generic Decision 3'

  };

  readonly container = this.page.locator('#pageContent');
  readonly heading = this.page.getByText('Session Booking', { exact: true });
  readonly listingDuration = this.page.locator('#defListingDuration');
  readonly durationDropdownButton = this.page.locator('#defListingDuration');
  readonly sessionStatusDropdown = this.page.getByLabel('Session Status: This field is');
  readonly hearingIconAll = this.page.locator('.booking-icon-group i.glyphicon');
  readonly hearingIconEarphone = this.page.locator('.booking-icon-group i.glyphicon-earphone')
  readonly sessionHearingChannel  = this.page.getByRole('button', { name: 'Hearing Channel:' });
  readonly sessionHearingChannelTel = this.page.locator('a').filter({ hasText: 'Telephone - Other' });
  readonly sessionHearingChannelVid = this.page.locator('a').filter({ hasText: 'Video - CVP' });
  readonly saveButton = this.page.locator('#svb');
  readonly deleteButton = this.page.locator('#dvb');
  readonly popupFrame = this.page.frameLocator("#container iframe[name='addAssociation']");

  readonly popup = {
    form: this.popupFrame.locator('#listingPopupForm'),
    saveButton: this.popupFrame.locator('#saveListingBtn'),
    cancelButton: this.popupFrame.locator('#cancelListingBtn'),
    hearingType: this.popupFrame.locator('#hearingType'),
  };
  readonly cancelListingButton = this.page.locator('#handleListingImgId').last();
  readonly cancelPopup = {
    popup: this.page.locator('#vbCancelReasonsLov'),
    cancelDropdown: this.page.locator('#cancellationCode'),
  };
  readonly confirmPopup = {
    confirmButton: this.page.locator('.modal-content #ok-btn'),
  };

  constructor(page: Page) {
    super(page);
  }

  getToggleSessionButton(roomName: string) {

    return this.page.locator(`button[title="Expand"]
    [aria-label="Toggle sessions details for room: ${roomName}"]`);

  }

  async bookSession(duration: string, sessionStatus: string) {
    await this.waitForLoad();
    await expect(this.heading).toBeVisible();
    await this.durationDropdownButton.click();
    await this.selectListingDuration(duration);
    await this.sessionStatusDropdown.selectOption(sessionStatus);
    await this.sessionHearingChannel.click();
    await this.sessionHearingChannelTel.click();
    await this.sessionHearingChannelVid.click();

    let validationPopup;
    try {
      const pagePromise = this.page.waitForEvent('popup', { timeout: 5000 });
      await this.page.getByRole('button', { name: 'Save' }).click();
      validationPopup = await pagePromise;
      await validationPopup.waitForLoadState('domcontentloaded');

      // interacting with validation popup

      await validationPopup.getByRole('combobox', { name: 'Reason to override rule/s *' })
        .selectOption({ label: this.CONSTANTS.CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON });
      await validationPopup.getByRole('button', { name: 'SAVE & CONTINUE LISTING' }).click();
      await this.checkingListingIframe();

    } catch {
      await this.checkingListingIframe();
    }
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

  async selectListingDuration(duration: string) {
    // This dropdown can be flaky, so extra wait steps
    // TODO: Replace implicit wait
    await this.page.waitForTimeout(3_000);
    await this.listingDuration.selectOption(duration);
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
        },
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
        },
      )
      .toBeTruthy();
  }

  async checkingListingIframe() {
    const listingIframe = this.page.locator('iframe[name="addAssociation"]');

    // Wait for the iframe to be visible
    await expect
      .poll(
        async () => {
          return await listingIframe.isVisible();
        },
        {
          intervals: [1_000],
          timeout: 20_000,
        },
      )
      .toBeTruthy();

    await expect(listingIframe.contentFrame().getByLabel('Hearing Type')).toBeVisible();
    const hearingTypeBtn = await listingIframe.contentFrame().getByRole('button', { name: 'Please Choose...' });

    if (await hearingTypeBtn.isVisible()) {
      await hearingTypeBtn.click();
      await listingIframe
        .contentFrame()
        .getByRole('list')
        .getByRole('option', { name: 'Allocation Hearing', exact: true })
        .click();
      await listingIframe.contentFrame().getByRole('button', { name: 'Save', exact: true }).click();

    } else {
      await listingIframe.contentFrame().getByRole('button', { name: 'Save', exact: true }).click();
    }
  }
}
