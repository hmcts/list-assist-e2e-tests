import { expect, Page } from "@playwright/test";
import { Base } from "../../base";

export class SessionBookingPage extends Base {
  readonly CONSTANTS = {
    //case listing
    CASE_LISTING_REGION_WALES: "Wales",
    CASE_LISTING_REGION_MIDLANDS: "Midlands",
    CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS:
      "Wales Civil, Family and Tribunals",
    CASE_LISTING_CLUSTER_MIDLANDS_LEICESTERSHIRE_RUTLAND_LINCOLNSHIRE_NORTH:
      "Leicestershire, Rutland, Lincolnshire and North",
    CASE_LISTING_LOCATION_LEICESTER_CC_7: "Leicester County Courtroom 07",
    CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1: "Pontypridd Courtroom 01",
    CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT:
      "Pontypridd County Court and",
    CASE_LISTING_LOCALITY_LEICESTER_CC: "Leicester Combined Court",
    CASE_LISTING_LOCALITY_CAERNARFON_JC: "Caernarfon Justice Centre",
    CASE_LISTING_LOCALITY_ABERYSTWYTH_JC: "Aberystwyth Justice Centre",
    CASE_LISTING_LOCATION_LOCATION_CAERNARFON_CHMBRS_5:
      "Caernarfon Chambers 05",
    CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC:
      "Newport (South Wales) County Court and Family Court",
    CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC: "Wrexham County and Family Court",
    CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1:
      "Newport (South Wales) Chambers 01",
    CASE_LISTING_LOCATION_WREXHAM_CRTRM_01: "Wrexham Courtroom 01",

    CASE_LISTING_JURISDICTION_FAMILY_CODE_AB: "AB",
    CASE_LISTING_JURISDICTION_CIVIL_CODE_CIV: "CIV",

    CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1: "Aberystwyth Courtroom 01",
    CASE_LISTING_SESSION_STATUS_TYPE_RELEASED: "5",
    CASE_LISTING_SESSION_STATUS_TYPE_APPROVED: "4",
    CASE_LISTING_SESSION_DURATION_1_00: "60",
    CASE_LISTING_COLUMN_ONE: "columnOne",
    CASE_LISTING_COLUMN_TWO: "columnTwo",
    CASE_LISTING_HEARING_TYPE_APPLICATION: "Application",
    CASE_LISTING_CANCEL_REASON_AMEND: "Amend",

    AUTO_JUDICIAL_OFFICE_HOLDER_01: "Benson, David (Mr David Benson)",
    AUTO_JUDICIAL_OFFICE_HOLDER_02: "Dunn, Matthew (Matthew Dunn)",
    AUTO_JUDICIAL_OFFICE_HOLDER_03: "Laverne, Sally (District Judge Laverne)",
    AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH:
      "AutomationTest, JOH (Automation Test JOH)",

    AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH_TWO:
      "AutomationTest, JOH-Two (AutomationTest-JOH-Two)",

    //session details
    SESSION_DETAILS_CANCELLATION_CODE_CANCEL: "CNCL",
    //session hearing channels
    SESSION_HEARING_CHANNEL_IN_PERSON: "In Person (child)",
    SESSION_HEARING_CHANNEL_TELEPHONE: "Telephone - Other",

    CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON: "Generic Decision 3",
  };
  readonly container = this.page.locator("#pageContent");
  readonly heading = this.page.getByText("Session Booking", { exact: true });
  readonly listingDuration = this.page.locator("#defListingDuration");
  readonly durationDropdownButton = this.page.locator("#defListingDuration");
  readonly sessionJohDropdown = this.page.locator(
    'div.bootstrap-select > button[data-id="membersList"]',
  );

  readonly sessionStatusDropdown = this.page.getByLabel(
    "Session Status: This field is",
  );
  readonly sessionHearingChannel = this.page.getByRole("button", {
    name: "Hearing Channel:",
  });
  readonly sessionHearingChannelTel = this.page
    .locator("a")
    .filter({ hasText: "Telephone - Other" });
  readonly sessionHearingChannelVid = this.page
    .locator("a")
    .filter({ hasText: "Video - CVP" });
  readonly saveButton = this.page.locator("#svb");
  readonly allIcons = this.page.locator(
    ".booking-icon-group > span.booking-icon",
  );
  readonly phoneIcons = this.page.locator(
    ".booking-icon-group > span.booking-icon > i.glyphicon-earphone",
  );

  readonly interpreterLanguageIcon = this.page.locator(
    ".booking-icon-group > span.booking-icon > i.glyphicon-globe",
  );
  readonly videoIcons = this.page.locator(
    ".booking-icon-group > span.booking-icon > i.glyphicon-facetime-video",
  );
  readonly inPersonIcons = this.page.locator(
    ".booking-icon-group > span.booking-icon > i.glyphicon-user",
  );

  readonly listingSaveButton = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole("button", { name: "Save", exact: true });
  readonly deleteButton = this.page.locator("#dvb");
  readonly popupFrame = this.page.frameLocator(
    "#container iframe[name='addAssociation']",
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

  //advanced filters
  readonly advancedFiltersButton = this.page.getByRole("button", {
    name: "Advanced Filters",
  });
  readonly advancedFiltersHeader = this.page.locator(
    "header#advancedFilter___BV_modal_header_ h2.header-title",
    {
      hasText: "HS Advanced Filters",
    },
  );
  readonly clearAdvanceFilterButton = this.page
    .getByRole("dialog", { name: "Advanced Filter" })
    .getByLabel("Clear filter criteria");

  readonly regionDropdown = this.page.getByText("Region", { exact: true });
  readonly clusterDropDown = this.page.getByText("Cluster", { exact: true });
  readonly localityDropDown = this.page
    .getByLabel("Advanced Filter", { exact: true })
    .getByText("Locality");
  readonly locationDropDown = this.page
    .getByLabel("Location filter list with 0")
    .getByText("Location");
  readonly locationFilterToggleButton = this.page
    .getByRole("group", { name: /Location filter list/i })
    .locator('span[role="button"][title="Toggle"].multiselect__custom-select');
  readonly applyButton = this.page
    .getByRole("dialog", { name: "Advanced Filter" })
    .getByLabel("Apply filter criteria");

  readonly sessionSummaryHearingChannel = this.page
    .locator("#bookingList tbody tr td")
    .nth(3);
  readonly bookingRow = this.page.locator("#bookingList tbody tr");
  readonly partiesColumn = this.bookingRow.locator("td").nth(4);
  readonly sessionSummaryAttendees = this.partiesColumn.locator("div");

  readonly scheduleButton = this.page.locator(
    "div.droparea span.sessionHeader",
    { hasText: this.CONSTANTS.CASE_LISTING_LOCATION_LEICESTER_CC_7 },
  );

  readonly jurisdictionDropdown = this.page.locator("select#jsCode");
  readonly sessionTypeDropdown = this.page.locator("select#sessionType");

  readonly internalCommentsTextBox = this.page.locator(
    "#venueBooking\\.venueBookingDesc",
  );
  readonly externalCommentsTextBox = this.page.locator(
    "#venueBooking\\.externalComments",
  );

  readonly hearingSessionLocationComment = this.page.locator(
    "textarea#listing\\.locationComment",
  );
  readonly hearingSessionInternalCaseComment = this.page.locator(
    'textarea[name="listing.comments"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async expandRoomButton() {
    const roomsButton = this.page.locator('button[title="Rooms"]');
    const icon = roomsButton.locator("i");
    const iconClass = await icon.getAttribute("class");
    if (!iconClass?.includes("down")) await roomsButton.click();
  }

  async bookSession(
    duration: string,
    sessionStatus: string,
    johName?: string,
    jurisdictionCode?: string,
    sessionType?: string,
    internalComments?: string,
    externalComments?: string,
    locationComment?: string,
    listingComment?: string,
  ) {
    await this.waitForLoad();
    await expect(this.heading).toBeVisible();

    // Duration dropdown - add explicit visibility wait
    await this.durationDropdownButton.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.durationDropdownButton.click();
    await this.selectListingDuration(duration);

    // Session status dropdown - add wait
    await this.sessionStatusDropdown.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.sessionStatusDropdown.selectOption(sessionStatus);

    // Hearing channel buttons - add wait before clicking
    await this.sessionHearingChannel.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.sessionHearingChannel.click();
    await this.sessionHearingChannelTel.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.sessionHearingChannelTel.click();
    await this.sessionHearingChannelVid.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.sessionHearingChannelVid.click();

    //conditional
    if (jurisdictionCode) {
      await this.jurisdictionDropdown.waitFor({
        state: "visible",
        timeout: 5000,
      });
      await this.jurisdictionDropdown.click();
      await this.jurisdictionDropdown.selectOption({ value: jurisdictionCode });
    }

    if (sessionType) {
      await this.sessionTypeDropdown.waitFor({
        state: "visible",
        timeout: 5000,
      });
      await this.sessionTypeDropdown.click();
      await this.sessionTypeDropdown.selectOption({ value: sessionType });
    }

    //add internal comments
    if (internalComments) {
      await this.internalCommentsTextBox.waitFor({
        state: "visible",
        timeout: 5000,
      });
      await this.internalCommentsTextBox.fill(internalComments);
    }

    //add external comments
    if (externalComments) {
      await this.externalCommentsTextBox.waitFor({
        state: "visible",
        timeout: 5000,
      });
      await this.externalCommentsTextBox.fill(externalComments);
    }

    //conditional
    if (johName) {
      // Ensure dropdown button is visible and accessible before clicking
      await this.sessionJohDropdown.waitFor({
        state: "visible",
        timeout: 5000,
      });

      const dropdownMenu = this.page.locator(
        "div.dropdown-menu.show ul.dropdown-menu.inner.show",
      );
      await expect
        .poll(
          async () => {
            await this.sessionJohDropdown.click();
            // Add wait for dropdown to appear
            await this.page.waitForTimeout(300); // Brief wait for dropdown animation
            if (await dropdownMenu.isVisible()) {
              const johOption = dropdownMenu.getByText(johName, {
                exact: true,
              });
              try {
                // Wait for option to be visible before clicking
                await johOption.waitFor({ state: "visible", timeout: 3000 });
                await johOption.click();
                return true;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('Failed to click JOH option:', errorMessage);
                return false;
              }
            }
            return false;
          },
          {
            intervals: [500],
            timeout: 15_000, // Increased timeout to account for explicit waits
          },
        )
        .toBeTruthy();
    }

    let validationPopup;
    try {
      const pagePromise = this.page.waitForEvent("popup", { timeout: 4000 });
      const saveBtn = this.page.getByRole("button", { name: "Save" });
      await saveBtn.waitFor({ state: "visible", timeout: 5000 });
      await saveBtn.click();
      validationPopup = await pagePromise;
      await validationPopup.waitForLoadState("domcontentloaded");
      // interacting with validation popup
      await validationPopup
        .getByRole("combobox", { name: "Reason to override rule/s *" })
        .selectOption({
          label: this.CONSTANTS.CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON,
        });
      const continueBtn = await validationPopup.getByRole("button", {
        name: "SAVE & CONTINUE LISTING",
      });
      await continueBtn.waitFor({ state: "visible", timeout: 5000 });
      await continueBtn.click();
      await this.checkingListingIframe(locationComment, listingComment);
    } catch {
      await this.checkingListingIframe(locationComment, listingComment);
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
    // Wait for dropdown to be stable before selecting
    await this.listingDuration.waitFor({ state: "visible", timeout: 5000 });
    // Optional network idle wait if needed
    try {
      await this.page
        .waitForLoadState("networkidle", { timeout: 3000 })
        .catch(() => {
          console.log(
            "Network idle timeout in selectListingDuration, proceeding anyway",
          );
        });
    } catch (error) {
      console.error("Error during networkidle wait:", error);
    }
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

  async checkingListingIframe(
    locationComment?: string,
    listingComment?: string,
  ) {
    const listingIframe = this.page.locator(
      '#container iframe[name="addAssociation"]',
    );

    // Wait for the iframe to be visible
    await expect
      .poll(async () => await listingIframe.first().isVisible(), {
        intervals: [1_000],
        timeout: 20_000,
      })
      .toBeTruthy();

    const contentFrame = await listingIframe.contentFrame();

    if (locationComment) {
      await contentFrame
        .locator("textarea#listing\\.locationComment")
        .fill(locationComment);
    }

    if (listingComment) {
      await contentFrame
        .locator('textarea[name="listing.comments"]')
        .fill(listingComment);
    }

    await expect(contentFrame.getByLabel("Hearing Type")).toBeVisible();
    const hearingTypeBtn = contentFrame.getByRole("button", {
      name: "Please Choose...",
    });

    if (await hearingTypeBtn.isVisible()) {
      await hearingTypeBtn.click();
      await contentFrame
        .getByRole("list")
        .getByRole("option", { name: "Allocation Hearing", exact: true })
        .click();
    }

    await contentFrame
      .getByRole("button", { name: "Save", exact: true })
      .click();
    await this.page.waitForTimeout(10_000);
  }

  async updateAdvancedFilterConfig(
    region: string,
    cluster: string,
    locality: string,
    location,
  ) {
    // Ensure advanced filters button is visible and enabled
    await this.advancedFiltersButton.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.advancedFiltersButton.click();

    // Wait for header to be visible before proceeding
    await expect(this.advancedFiltersHeader).toBeVisible();

    //ensure the advanced filter is cleared
    await this.clearAdvanceFilterButton.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.clearAdvanceFilterButton.click();
    await this.page.waitForTimeout(500); // Brief wait for UI to update

    //region dropdown and region selection
    await this.regionDropdown.waitFor({ state: "visible", timeout: 5000 });
    await this.regionDropdown.click();
    await this.page.waitForTimeout(300); // Wait for dropdown animation
    const regionOption = this.page
      .getByRole("option", { name: region })
      .locator("span")
      .nth(2);
    await regionOption.waitFor({ state: "visible", timeout: 5000 });
    await regionOption.click();

    //cluster dropdown and cluster selection
    await this.page.waitForTimeout(300); // Wait between interactions
    await this.clusterDropDown.waitFor({ state: "visible", timeout: 5000 });
    await this.clusterDropDown.click();
    await this.page.waitForTimeout(300); // Wait for dropdown animation
    const clusterOption = this.page
      .getByRole("option", { name: cluster })
      .locator("span")
      .nth(2);
    await clusterOption.waitFor({ state: "visible", timeout: 5000 });
    await clusterOption.click();

    //locality dropdown and locality selection
    await this.page.waitForTimeout(300); // Wait between interactions
    await this.localityDropDown.waitFor({ state: "visible", timeout: 5000 });
    await this.localityDropDown.click();
    await this.page.waitForTimeout(300); // Wait for dropdown animation
    const localityOption = this.page
      .getByRole("option", { name: locality })
      .locator("span")
      .nth(2);
    await localityOption.waitFor({ state: "visible", timeout: 5000 });
    await localityOption.click();

    //location dropdown and location selection
    await this.page.waitForTimeout(300); // Wait between interactions
    await this.locationDropDown.waitFor({ state: "visible", timeout: 5000 });
    await this.locationDropDown.click();
    await this.page.waitForTimeout(300); // Wait for dropdown animation
    const locationOption = this.page
      .getByRole("option", { name: location })
      .locator("span")
      .nth(2);
    await locationOption.waitFor({ state: "visible", timeout: 5000 });
    await locationOption.click();

    // Use the class property here
    await this.page.waitForTimeout(300); // Wait between interactions
    await this.locationFilterToggleButton.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.locationFilterToggleButton.click();

    //apply filter
    await this.page.waitForTimeout(300); // Wait between interactions
    await this.applyButton.waitFor({ state: "visible", timeout: 5000 });
    await this.applyButton.click();
  }
}
