import { expect, Page } from "@playwright/test";
import { Base } from "../../base";

export class NewUiSessionBookingPage extends Base {
  readonly CONSTANTS = {
    CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC:
      "Haverfordwest County and Family Court",
    CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01: "Haverfordwest Courtroom 01",
    CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04: "Haverfordwest Courtroom 04",
    SESSION_STATUS_RELEASED: "Released",
    SESSION_TYPE_ADHOC_AS_DIRECTED: "Adhoc (as directed)",
    DEFAULT_LISTING_DURATION_ONE_HOUR: "01:00",
    INTERNAL_COMMENT_PREFIX: "INTERNAL COMMENT ",
    EXTERNAL_COMMENT_PREFIX: "EXTERNAL COMMENT ",
    PANEL_MEMBER_AMANDA_FOSTER: "FOSTER, AMANDA",
    HEARING_TYPE_CHAMBERS_OUTCOME: "Chambers Outcome",
  };

  readonly editableStartTimeInput = this.page.locator("#editableStartTime");
  readonly startTimeCombobox = this.page.getByRole("combobox", {
    name: "Start Time list",
  });
  readonly startTimeSelectedValue = this.startTimeCombobox.locator(
    ".multiselect__single",
  );
  readonly endTimeCombobox = this.page.getByRole("combobox", {
    name: "End Time list",
  });
  readonly endTimeSelectedValue = this.endTimeCombobox.locator(
    ".multiselect__single",
  );
  readonly localityCombobox = this.page.getByRole("combobox", {
    name: "Locality list",
  });
  readonly localityComboboxToggle = this.localityCombobox.locator(
    ".multiselect__select",
  );
  readonly localitySelectedValue = this.localityCombobox.locator(
    ".multiselect__single",
  );
  readonly locationCombobox = this.page.getByRole("combobox", {
    name: "Location list",
  });
  readonly locationComboboxToggle = this.locationCombobox.locator(
    ".multiselect__select",
  );
  readonly locationSelectedValue = this.locationCombobox.locator(
    ".multiselect__single",
  );
  readonly sessionStatusCombobox = this.page.getByRole("combobox", {
    name: "Session Status list",
  });
  readonly sessionStatusSelectedValue = this.sessionStatusCombobox.locator(
    ".multiselect__single",
  );
  readonly sessionTypeCombobox = this.page.getByRole("combobox", {
    name: "Session Type list",
  });
  readonly sessionTypeComboboxToggle = this.sessionTypeCombobox.locator(
    ".multiselect__select",
  );
  readonly sessionTypeSelectedValue = this.sessionTypeCombobox.locator(
    ".multiselect__single",
  );
  readonly defaultListingDurationCombobox = this.page.getByRole("combobox", {
    name: "Default Listing Duration (hours) list",
  });
  readonly jurisdictionCombobox = this.page.getByRole("combobox", {
    name: "Jurisdiction list",
  });
  readonly serviceCombobox = this.page.getByRole("combobox", {
    name: "Service list",
  });
  readonly defaultListingDurationComboboxToggle =
    this.defaultListingDurationCombobox.locator(".multiselect__select");
  readonly defaultListingDurationSelectedValue =
    this.defaultListingDurationCombobox.locator(".multiselect__single");
  readonly sessionBookingDetailsHeading = this.page.getByRole("heading", {
    name: "Session Booking Details",
  });
  readonly sessionBookingDetailsSection = this.page
    .locator("div")
    .filter({ has: this.sessionBookingDetailsHeading })
    .filter({ has: this.localityCombobox })
    .first();
  readonly dateLabel = this.sessionBookingDetailsSection.getByText(/^Date\b/);
  readonly recurrenceLabel = this.sessionBookingDetailsSection.getByText(
    "Recurrence",
    { exact: true },
  );
  readonly startTimeLabel =
    this.sessionBookingDetailsSection.getByText(/^Start Time\b/);
  readonly endTimeLabel =
    this.sessionBookingDetailsSection.getByText(/^End Time\b/);
  readonly localityLabel =
    this.sessionBookingDetailsSection.getByText(/^Locality\b/);
  readonly locationLabel =
    this.sessionBookingDetailsSection.getByText(/^Location\b/);
  readonly jurisdictionLabel =
    this.sessionBookingDetailsSection.getByText(/^Jurisdiction\b/);
  readonly sessionStatusLabel =
    this.sessionBookingDetailsSection.getByText(/^Session Status\b/);
  readonly sessionTypeLabel =
    this.sessionBookingDetailsSection.getByText(/^Session Type\b/);
  readonly serviceLabel =
    this.sessionBookingDetailsSection.getByText(/^Service\b/);
  readonly overbookingAllowedLabel =
    this.sessionBookingDetailsSection.getByText(/^Overbooking Allowed\b/);
  readonly listingLimitMaxCasesLabel =
    this.sessionBookingDetailsSection.getByText("Listing Limit (Max. Cases)", {
      exact: true,
    });
  readonly percentageLimitLabel = this.sessionBookingDetailsSection.getByText(
    "Percentage Limit",
    { exact: true },
  );
  readonly groupBookingLabel =
    this.sessionBookingDetailsSection.getByText(/^Group Booking\b/);
  readonly defaultListingDurationHoursLabel =
    this.sessionBookingDetailsSection.getByText(
      /^Default Listing Duration \(hours\)\b/,
    );
  readonly breaksLabel = this.sessionBookingDetailsSection.getByText("Breaks", {
    exact: true,
  });
  readonly addBreakButton = this.sessionBookingDetailsSection.getByRole(
    "button",
    { name: "Add Break" },
  );
  readonly breakStartTimeCombobox = this.page.locator(
    '[aria-owns="start-time_listbox"]',
  );
  readonly breakEndTimeCombobox = this.page.locator(
    '[aria-owns="end-time_listbox"]',
  );
  readonly breakStartTimeOptions = this.page.locator(
    '#start-time_listbox [role="option"]',
  );
  readonly breakEndTimeOptions = this.page.locator(
    '#end-time_listbox [role="option"]',
  );
  readonly breakConfirmButton = this.page.getByRole("button", {
    name: /Create booking break with selected/i,
  });
  readonly breaksTable = this.sessionBookingDetailsSection.locator("table");
  readonly breaksStartTimeHeader = this.sessionBookingDetailsSection.getByRole(
    "columnheader",
    {
      name: "Start Time",
    },
  );
  readonly breaksEndTimeHeader = this.sessionBookingDetailsSection.getByRole(
    "columnheader",
    {
      name: "End Time",
    },
  );
  readonly breaksActionsHeader = this.sessionBookingDetailsSection.getByRole(
    "columnheader",
    {
      name: "Actions",
    },
  );
  readonly yesToggleOptions = this.sessionBookingDetailsSection.getByText(
    "Yes",
    { exact: true },
  );
  readonly noToggleOptions = this.sessionBookingDetailsSection.getByText("No", {
    exact: true,
  });
  readonly internalCommentsTextBox = this.page.locator(
    "#venueBooking\\.venueBookingDesc",
  );
  readonly externalCommentsTextBox = this.page.locator(
    "#venueBooking\\.externalComments",
  );

  startTimeOption(time: string) {
    return this.page
      .locator("#startTimeSelect_listbox")
      .getByRole("option", { name: time, exact: true });
  }

  endTimeOption(time: string) {
    return this.page
      .locator("#endTimeSelect_listbox")
      .getByRole("option", { name: time, exact: true });
  }

  localityOption(locality: string) {
    return this.localityCombobox.getByRole("option", {
      name: locality,
      exact: true,
    });
  }

  locationOption(location: string) {
    return this.locationCombobox.getByRole("option", {
      name: location,
      exact: true,
    });
  }

  sessionTypeOption(sessionType: string) {
    return this.sessionTypeCombobox.getByRole("option", {
      name: sessionType,
      exact: true,
    });
  }

  defaultListingDurationOption(duration: string) {
    return this.defaultListingDurationCombobox.getByRole("option", {
      name: duration,
      exact: true,
    });
  }

  async assertLocality(locality: string) {
    await expect(this.localityCombobox).toBeVisible();
    await expect(this.localitySelectedValue).toBeVisible();
    await expect(this.localitySelectedValue).toHaveText(locality);
  }

  async assertLocation(location: string) {
    await expect(this.locationCombobox).toBeVisible();
    await expect(this.locationSelectedValue).toBeVisible();
    await expect(this.locationSelectedValue).toHaveText(location);
  }

  async assertStartTime(time: string) {
    await expect(this.startTimeCombobox).toBeVisible();
    await expect(this.startTimeSelectedValue).toBeVisible();
    await expect(this.startTimeSelectedValue).toHaveText(time);
  }

  async assertEndTime(time: string) {
    await expect(this.endTimeCombobox).toBeVisible();
    await expect(this.endTimeSelectedValue).toBeVisible();
    await expect(this.endTimeSelectedValue).toHaveText(time);
  }

  async assertSessionStatus(status: string) {
    await expect(this.sessionStatusCombobox).toBeVisible();
    await expect(this.sessionStatusSelectedValue).toBeVisible();
    await expect(this.sessionStatusSelectedValue).toHaveText(status);
  }

  async selectAndAssertSessionType(sessionType: string) {
    await expect(this.sessionTypeCombobox).toBeVisible();
    await this.sessionTypeComboboxToggle.click();
    await expect(this.sessionTypeOption(sessionType)).toBeVisible();
    await this.sessionTypeOption(sessionType).click();
    await expect(this.sessionTypeSelectedValue).toHaveText(sessionType);
  }

  async selectAndAssertDefaultListingDuration(duration: string) {
    await expect(this.defaultListingDurationCombobox).toBeVisible();
    await this.defaultListingDurationComboboxToggle.click();
    await expect(this.defaultListingDurationOption(duration)).toBeVisible();
    await this.defaultListingDurationOption(duration).click();
    await expect(this.defaultListingDurationSelectedValue).toHaveText(duration);
  }

  async assertDateIsNotEditableInEditMode() {
    await expect(this.editableStartTimeInput).toBeVisible();
    const dateInputIsEditable = await this.editableStartTimeInput.evaluate(
      (input: HTMLInputElement) => !input.readOnly && !input.disabled,
    );
    expect(dateInputIsEditable).toBeFalsy();
  }

  async assertDefaultListingDurationNotEditableWhenListingExists(
    selectedDuration: string,
  ) {
    await expect(this.defaultListingDurationCombobox).toBeVisible();
    await expect(this.defaultListingDurationSelectedValue).toHaveText(
      selectedDuration,
    );
    await expect(this.defaultListingDurationCombobox).toHaveAttribute(
      "tabindex",
      "-1",
    );
    await expect(this.defaultListingDurationCombobox).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(
      this.page.locator("#defListingDuration_listbox"),
    ).not.toBeVisible();
  }

  async fillInternalComment(comment: string) {
    await expect(this.internalCommentsTextBox).toBeVisible();
    await this.internalCommentsTextBox.click();
    await this.internalCommentsTextBox.fill(comment);
  }

  async fillExternalComment(comment: string) {
    await expect(this.externalCommentsTextBox).toBeVisible();
    await this.externalCommentsTextBox.click();
    await this.externalCommentsTextBox.fill(comment);
  }

  async assertSessionBookingDetailsUiElementsVisible() {
    await expect(this.sessionBookingDetailsHeading).toBeVisible();

    await expect(this.editableStartTimeInput).toBeVisible();
    await expect(this.yesToggleOptions.first()).toBeVisible();
    await expect(this.noToggleOptions.first()).toBeVisible();

    await expect(this.startTimeCombobox).toBeVisible();
    await expect(this.endTimeCombobox).toBeVisible();
    await expect(this.localityCombobox).toBeVisible();
    await expect(this.locationCombobox).toBeVisible();
    await expect(this.jurisdictionCombobox).toBeVisible();
    await expect(this.sessionStatusCombobox).toBeVisible();
    await expect(this.sessionTypeCombobox).toBeVisible();
    await expect(this.serviceCombobox).toBeVisible();
    await expect(this.defaultListingDurationCombobox).toBeVisible();

    await expect(this.addBreakButton).toBeVisible();
    await expect(this.breaksStartTimeHeader.first()).toBeVisible();
    await expect(this.breaksEndTimeHeader.first()).toBeVisible();
    await expect(this.breaksActionsHeader.first()).toBeVisible();
  }

  // listing popup
  readonly listingPopup = this.page.locator("#listingPopup");
  readonly listingPopupHearingTypeCombobox = this.listingPopup.getByRole(
    "combobox",
    { name: "Listing Detail - Hearing Type list" },
  );
  readonly listingPopupHearingTypeToggle =
    this.listingPopupHearingTypeCombobox.locator(".multiselect__select");
  readonly listingPopupSaveButton =
    this.listingPopup.locator("#saveListingBtn");

  listingPopupHearingTypeOption(hearingType: string) {
    return this.listingPopup
      .locator("#listingEventTypeId_listbox")
      .getByRole("option", { name: hearingType, exact: true });
  }

  async selectHearingTypeInListingPopup(hearingType: string) {
    await expect(this.listingPopup).toBeVisible();
    await this.listingPopupHearingTypeToggle.click();
    await expect(this.listingPopupHearingTypeOption(hearingType)).toBeVisible();
    await this.listingPopupHearingTypeOption(hearingType).click();
    await expect(this.listingPopupSaveButton).toBeVisible();
    await this.listingPopupSaveButton.click();
  }

  readonly addPanelMemberButton = this.page.locator("#addPanelMemberId");

  async clickAddPanelMember() {
    await expect(this.addPanelMemberButton).toBeVisible();
    await this.addPanelMemberButton.click();
  }

  readonly panelMembersSearchField = this.page.locator(
    "#panelMembersTableCard_searchFld",
  );
  readonly panelMembersPopupContent = this.page.locator(
    "#panelMemberPopup___BV_modal_content_",
  );
  readonly panelMembersTableLoadingOverlay = this.page.locator(
    "#panelMembersTableCardLoadingOverlay_wrapper",
  );

  async searchPanelMember(name: string) {
    //this is a work around for a problem in the List Assist base product
    //MCGIRRSD-98001
    await this.clickIgnoreFiltersAndReturnAll();

    await this.panelMembersPopupContent.waitFor({ state: "visible" });
    await this.panelMembersSearchField.click();
    await this.panelMembersSearchField.pressSequentially(name);
  }

  readonly selectAndSaveFirstPanelMemberButton = this.page
    .getByRole("button", { name: "Select & Save" })
    .first();
  readonly ignoreFiltersAndReturnAllButton = this.page.getByRole("button", {
    name: "Ignore Filters & Return All",
  });

  readonly noSpecialismConfirmationOkButton = this.page.getByRole("button", {
    name: "OK",
    exact: true,
  });
  readonly saveSessionBookingButton = this.page.locator("#saveVenueBooking");

  async clickSelectAndSaveFirstPanelMember() {
    await expect(this.selectAndSaveFirstPanelMemberButton).toBeVisible();
    await this.selectAndSaveFirstPanelMemberButton.click();
  }

  async dismissNoSpecialismConfirmationIfPresent() {
    const okButton = this.noSpecialismConfirmationOkButton;
    const isVisible = await okButton.isVisible();
    if (isVisible) {
      await okButton.click();
    }
  }

  async clickIgnoreFiltersAndReturnAll() {
    await expect(this.ignoreFiltersAndReturnAllButton).toBeVisible();
    await this.ignoreFiltersAndReturnAllButton.click();
  }

  async clickSaveSessionBooking() {
    await expect(this.saveSessionBookingButton).toBeVisible();
    await this.saveSessionBookingButton.click();
  }

  async createSessionWithoutBasketedCase(
    hearingSchedulePage,
    sessionBookingPage,
    dataUtils,
    locality,
    location,
    dateFrom,
    dateTo,
  ) {
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await expect(hearingSchedulePage.header).toBeVisible();
    await sessionBookingPage.updateAdvancedFilterConfig(
      undefined,
      undefined,
      locality,
      location,
    );

    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await expect(hearingSchedulePage.header).toBeVisible();
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(dateFrom),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(dateTo),
    );

    await expect(hearingSchedulePage.addBookingButton).toBeVisible();
    await hearingSchedulePage.addBookingButton.click();

    await expect(hearingSchedulePage.createSessionButton).toBeVisible();
    await hearingSchedulePage.createSessionButton.click();

    await expect(sessionBookingPage.heading).toBeVisible();
    await expect(sessionBookingPage.heading).toHaveText("Session Booking");
  }

  getBreakRowByStartTime(startTime: string) {
    return this.breaksTable
      .filter({
        has: this.page.locator(`text=${startTime}`),
      })
      .first();
  }

  constructor(page: Page) {
    super(page);
  }
}
