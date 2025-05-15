import { expect, Page } from '@playwright/test';
import { Base } from '../../base';

export class SessionBookingPage extends Base {
  readonly CONSTANTS = {
    //case listing
    CASE_LISTING_REGION_WALES: 'Wales',
    CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS: 'Wales Civil, Family and Tribunals',
    CASE_LISTING_LOCATION_LEICESTER_CC_7: 'Leicester County Courtroom 07',
    CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1: 'Pontypridd Courtroom 01',
    CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT: 'Pontypridd County Court and',
    CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC: 'Newport (South Wales) County Court and Family Court',
    CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1: 'Newport (South Wales) Chambers 01',
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

    CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON: 'Generic Decision 3',
  };

  readonly container = this.page.locator('#pageContent');
  readonly heading = this.page.getByText('Session Booking', { exact: true });
  readonly listingDuration = this.page.locator('#defListingDuration');
  readonly durationDropdownButton = this.page.locator('#defListingDuration');
  readonly sessionStatusDropdown = this.page.getByLabel('Session Status: This field is');
  readonly sessionHearingChannel = this.page.getByRole('button', { name: 'Hearing Channel:' });
  readonly sessionHearingChannelTel = this.page.locator('a').filter({ hasText: 'Telephone - Other' });
  readonly sessionHearingChannelVid = this.page.locator('a').filter({ hasText: 'Video - CVP' });
  readonly saveButton = this.page.locator('#svb');
  readonly allIcons = this.page.locator('.booking-icon-group > span.booking-icon');
  readonly phoneIcons = this.page.locator('.booking-icon-group > span.booking-icon > i.glyphicon-earphone');
  readonly interpreterLanguageIcon = this.page.locator('.booking-icon-group > span.booking-icon > i.glyphicon-globe');
  readonly listingSaveButton = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole('button', { name: 'Save', exact: true });
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

  //advanced filters
  readonly advancedFiltersButton = this.page.getByRole('button', { name: 'Advanced Filters' });
  readonly advancedFiltersHeader = this.page.locator('header#advancedFilter___BV_modal_header_ h2.header-title', {
    hasText: 'HS Advanced Filters',
  });
  readonly clearAdvanceFilterButton = this.page
    .getByRole('dialog', { name: 'Advanced Filter' })
    .getByLabel('Clear filter criteria');

  readonly regionDropdown = this.page.getByText('Region', { exact: true });
  readonly clusterDropDown = this.page.getByText('Cluster', { exact: true });
  readonly localityDropDown = this.page.getByLabel('Advanced Filter', { exact: true }).getByText('Locality');
  readonly locationDropDown = this.page.getByLabel('Location filter list with 0').getByText('Location');
  readonly applyButton = this.page.getByRole('dialog', { name: 'Advanced Filter' }).getByLabel('Apply filter criteria');

  constructor(page: Page) {
    super(page);
  }

  async expandRoomButton() {
    const roomsButton = this.page.locator('button[title="Rooms"]');
    const icon = roomsButton.locator('i');
    const iconClass = await icon.getAttribute('class');

    if (iconClass?.includes('glyphicon-menu-right')) await roomsButton.click();
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

      await validationPopup
        .getByRole('combobox', { name: 'Reason to override rule/s *' })
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
    const listingIframe = this.page.locator('#container iframe[name="addAssociation"]');

    // Wait for the iframe to be visible
    await expect
      .poll(
        async () => {
          return await listingIframe.first().isVisible();
        },
        {
          intervals: [1_000],
          timeout: 20_000,
        },
      )
      .toBeTruthy();

    const contentFrame = await listingIframe.contentFrame();
    if (!contentFrame) {
      throw new Error('Failed to locate content frame inside the iframe.');
    }

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
      const saveButton = contentFrame.getByRole('button', { name: 'Save', exact: true });
      await expect
        .poll(
          async () => {
            return await saveButton.isVisible();
          },
          {
            intervals: [1_000],
            timeout: 20_000,
          },
        )
        .toBeTruthy();

      await saveButton.click();
    }
  }

  async updateAdvancedFilterConfig(region: string, cluster: string, locality: string, location) {
    await this.advancedFiltersButton.click();
    await expect(this.advancedFiltersHeader).toBeVisible();
    //ensure the advanced filter is cleared
    await this.clearAdvanceFilterButton.click();

    //region dropdown and region selection
    await this.regionDropdown.click();
    await this.page.getByRole('option', { name: region }).locator('span').nth(2).click();

    //cluster dropdown and cluster selection
    await this.clusterDropDown.click();
    await this.page.getByText(cluster).click();

    //locality dropdown and locality selection
    await this.localityDropDown.click();
    await this.page.getByRole('option', { name: locality }).locator('span').nth(2).click();

    //location dropdown and location selection
    await this.locationDropDown.click();
    await this.page.getByRole('option', { name: location }).locator('span').nth(2).click();

    //apply filter
    await this.applyButton.click();
  }
}
