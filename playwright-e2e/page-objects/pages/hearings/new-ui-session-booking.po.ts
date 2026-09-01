import { expect, Page, Locator } from "@playwright/test";
import { Base } from "../../base";
interface TableRow {
  roomName: string;
  row: Locator;
  columnOne: Locator;
  columnTwo: Locator;
  columnThree: Locator;
  columnFour: Locator;
  columnFive: Locator;
}
export class NewUiSessionBookingPage extends Base {
  readonly CONSTANTS = {
    SESSION_JURISDICTION_CIVIL: "Civil",
    CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC:
      "Haverfordwest County and Family Court",
    CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01: "Haverfordwest Courtroom 01",

    CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_05: "Haverfordwest Courtroom 05",

    SESSION_STATUS_RELEASED: "Released",
    SESSION_TYPE_ADHOC_AS_DIRECTED: "Adhoc (as directed)",
    DEFAULT_LISTING_DURATION_ONE_HOUR: "01:00",
    INTERNAL_COMMENT_PREFIX: "INTERNAL COMMENT ",
    EXTERNAL_COMMENT_PREFIX: "EXTERNAL COMMENT ",
    PANEL_MEMBER_AMANDA_FOSTER: "FOSTER, AMANDA",
    HEARING_TYPE_CHAMBERS_OUTCOME: "Chambers Outcome",
    CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON: "Generic Decision 3",
    SESSION_HEARING_CHANNEL_IN_PERSON: "In Person (child)",
    SESSION_HEARING_CHANNEL_TELEPHONE: "Telephone - Other",
    SESSION_HEARING_CHANNEL_VIDEO: "Video - CVP",
  };
  readonly table = this.page.locator("#membersOrRoomsTable");
  readonly separatorValue = "--------------------------";
  readonly scheduleSelector = 'div[booking="item"]';
  readonly createSessionButton = this.page.locator("#createSession");

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
  readonly jurisdictionComboboxToggle = this.jurisdictionCombobox.locator(
    ".multiselect__select",
  );
  readonly jurisdictionSelectedValue = this.jurisdictionCombobox.locator(
    ".multiselect__single",
  );
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
  readonly hearingChannelFilterGroup = this.page
    .getByRole("group", { name: /filter list with/i })
    .first();
  readonly hearingChannelOpenListboxButton =
    this.hearingChannelFilterGroup.getByRole("button", {
      name: "Open listbox",
    });

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

  jurisdictionOption(jurisdiction: string) {
    return this.jurisdictionCombobox.getByRole("option", {
      name: jurisdiction,
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

  async selectAndAssertSessionJurisdiction(jurisdiction: string) {
    await expect(this.jurisdictionCombobox).toBeVisible();
    await this.jurisdictionComboboxToggle.click();
    await expect(this.jurisdictionOption(jurisdiction)).toBeVisible();
    await this.jurisdictionOption(jurisdiction).click();
    await expect(this.jurisdictionSelectedValue).toHaveText(jurisdiction);
  }

  sessionHearingChannelOption(hearingChannel: string) {
    return this.page.getByRole("option", {
      name: hearingChannel,
      exact: true,
    });
  }

  async selectSessionHearingChannels(...hearingChannels: string[]) {
    if (hearingChannels.length < 1 || hearingChannels.length > 3) {
      throw new Error(
        `Expected 1 to 3 hearing channels, received ${hearingChannels.length}`,
      );
    }

    await expect(this.hearingChannelOpenListboxButton).toBeVisible();
    for (const hearingChannel of hearingChannels) {
      await this.hearingChannelOpenListboxButton.click();
      await expect(
        this.sessionHearingChannelOption(hearingChannel),
      ).toBeVisible();
      await this.sessionHearingChannelOption(hearingChannel).click();
    }
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

  async clickSaveListing() {
    await expect(this.listingPopupSaveButton).toBeVisible();
    await this.listingPopupSaveButton.click();
  }

  async handleListingValidationPopup(
    validationPopup: import("@playwright/test").Page,
    overrideReason: string,
  ) {
    await validationPopup.waitForLoadState("domcontentloaded");
    await validationPopup
      .getByRole("combobox", { name: "Reason to override rule/s *" })
      .selectOption({ label: overrideReason });
    await validationPopup
      .getByRole("button", { name: "SAVE & CONTINUE LISTING" })
      .click();
  }

  async listCaseFromSessionSummary(caseNumber: string, hearingType: string) {
    const caseRow = this.page
      .locator("#matterCartList a")
      .filter({ hasText: caseNumber })
      .first();

    await expect(caseRow).toBeVisible();

    const validationPopupPromise = this.page
      .waitForEvent("popup", { timeout: 4_000 })
      .catch(() => null);

    await caseRow.click();

    const validationPopup = await validationPopupPromise;
    if (validationPopup) {
      await this.handleListingValidationPopup(
        validationPopup,
        this.CONSTANTS.CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON,
      );
    }

    await this.selectHearingTypeInListingPopup(hearingType);
    await this.clickSaveListing();
  }

  async waitForLoad(): Promise<void> {
    await expect
      .poll(
        async () => {
          return await this.table.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();
  }

  async createSessionWithoutCase(
    roomName: string,
    column: string,
    jurisdiction?: string,
    hearingChannels?: string[],
  ): Promise<void> {
    await this.page.locator("#roomHS").click();
    await this.page.waitForTimeout(1000);
    await this.waitForLoad();
    const table: TableRow[] = await this.mapTable();
    const row = table.filter((row) => row.roomName === roomName)[0];
    await expect(row[column].locator(`${this.scheduleSelector}`)).toBeVisible();
    await row[column].locator(`${this.scheduleSelector}`).click();
    await expect(this.createSessionButton).toBeVisible();
    await this.createSessionButton.click();
    if (jurisdiction) {
      await this.selectAndAssertSessionJurisdiction(jurisdiction);
    }
    await this.selectAndAssertDefaultListingDuration(
      this.CONSTANTS.DEFAULT_LISTING_DURATION_ONE_HOUR,
    );
    if (hearingChannels && hearingChannels.length > 0) {
      await this.selectSessionHearingChannels(...hearingChannels);
    }
    await this.clickSaveSessionBooking();
    //await this.sessionBookingPage.waitForLoad();
  }

  async mapTable(): Promise<TableRow[]> {
    const table: TableRow[] = [];
    const rows = await this.table.locator("tbody > tr").all();

    for (const row of rows) {
      // Filter out expanded rows
      const firstCell = (await row.locator("td").first().textContent())?.trim();
      if (firstCell?.includes(this.separatorValue) || !firstCell) continue;

      const roomName = await row
        .locator("td")
        .first()
        .locator("b")
        .textContent();
      if (!roomName) {
        throw new Error("Row or room not found");
      }

      table.push({
        roomName: roomName,
        row: row,
        columnOne: row.locator("td").nth(1),
        columnTwo: row.locator("td").nth(2),
        columnThree: row.locator("td").nth(3),
        columnFour: row.locator("td").nth(4),
        columnFive: row.locator("td").nth(5),
      });
    }
    return table;
  }

  async createSessionWithoutBasketedCase(
    loginPage,
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

  constructor(page: Page) {
    super(page);
  }
}
