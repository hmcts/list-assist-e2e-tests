import { Locator, Page, expect } from "@playwright/test";
import { Base } from "../../base";
import { SessionBookingPage } from "./session-booking.po.ts";

interface TableRow {
  roomName: string;
  row: Locator;
  columnOne: Locator;
  columnTwo: Locator;
  columnThree: Locator;
  columnFour: Locator;
  columnFive: Locator;
}

export class HearingSchedulePage extends Base {
  private sessionBookingPage: SessionBookingPage;

  readonly container = this.page.locator("#pageContent");
  readonly header = this.page.locator("#hs-header");
  readonly tabList = this.page.locator("#joh-tabs");
  readonly table = this.page.locator("#membersOrRoomsTable");
  readonly bookingCell = this.page.locator("div.droparea.addBooking");
  readonly tabNameJudicialOfficeHolders = "Judicial Office Holders";
  readonly tabNameRooms = "Rooms";
  readonly primaryFilterToggleButton = this.page.locator(
    "#togglePrimaryFilter",
  );
  readonly primaryFilterFromDateInput = this.page.locator(
    "#primaryFilter_fromDate_input",
  );
  readonly primaryFilterToDateInput = this.page.locator(
    "#primaryFilter_toDate_input",
  );
  readonly applyPrimaryFilterButton = this.page.locator(
    'button.mcms-btn-solid:has-text("Apply")',
  );
  readonly tableHeaders = this.table.locator("thead th");
  readonly schedulePopup = {
    createSession: this.page.locator("#createSession"),
    roomUnavailability: this.page.locator("#createTimeOffOrRoomUnavailability"),
    basketItem: this.page
      .locator("#venueBookingList")
      .getByLabel("Go to session details page"),
  };
  readonly scheduleSelector = 'div[booking="item"]';
  readonly siblingRow = "+ tr";
  readonly separatorValue = "--------------------------";
  readonly confirmListingReleasedStatus = this.page.locator(
    'button[title="Show booking details"] .hs-session-status',
    {
      hasText: "Released",
    },
  );
  readonly listingSquareIcons = this.page.locator("div.hs-booking-shape");
  readonly rowWithHmctsCn = this.page.locator('tr[role="row"]');
  readonly addBookingButton = this.page
    .locator("div.droparea.addBooking > button.btn.text-center")
    .first();

  readonly createSessionButton = this.page.locator("#createSession");

  //multi-day listings
  readonly recurranceCheckbox = this.page.locator("#recurrenceCheckbox");
  readonly recurranceWeeksTextbox = this.page.locator("#recWeeks");

  readonly deleteSessionBookingModalHeader = this.page.locator(
    "#recVenueBookingDelAlert #CMSHomeHeading",
  );

  readonly clearAllASessionsRadioButton = this.page.locator(
    '.clsPopup input[type="radio"][name="delRecVb"][value="true"]',
  );

  readonly clearAllSessionsOkButton = this.page.locator(
    "#recVenueBookingDelAlert #ok_btn_id",
  );

  readonly deleteHearingButton = this.page.locator(
    'input[type="button"]#dvb[name="Delete"][value="Delete"]',
  );

  readonly saveButton = this.page.locator("#svb");
  readonly recurranceDateUntilTextBox = this.page.locator("#bbb");

  //all locations in grid that contain the word 'Released'
  readonly cellsWithReleasedStatus = this.page.locator(
    'span.hs-session-status:text("Released")',
  );

  //scheduling
  readonly goToSessionDetailsButton = this.page.getByRole("button", {
    name: "Go to Session Details screen",
  });
  readonly deleteSessionButton = this.page.locator(
    'input[type="button"]#dvb[name="Delete"][value="Delete"]',
  );
  readonly deleteSessionInSessionDetailsButton = this.page
    .locator("#handleListingImgId")
    .nth(1);

  readonly releasedStatusCheck = this.page.locator(
    'button[title="Show booking details"] .hs-session-status',
    {
      hasText: "Released",
    },
  );

  //multi-day
  readonly multiDayLink = this.page.locator("td a", { hasText: "Multi-Day" });
  readonly multiDaysEditPageHeader = this.page.locator(
    "div.card-header h1.header-title",
    { hasText: "Multi Days Edit" },
  );
  readonly selectAllCancelListingsCheckbox = this.page.locator(
    "#cancelListingSelectAll_checkmark",
  );

  readonly cancelListingButton = this.page.locator(
    'button:has(span.mcms-btn-label:text("Cancel Listings"))',
  );
  readonly confirmationCanxAdv = this.page.locator(
    'div.modal-content#\\__BVID__53___BV_modal_content_:has(.header-title:has-text("Confirmation"))',
  );

  readonly confirmationCanxAdvConfirm = this.page.locator(
    'div.modal-content#\\__BVID__49___BV_modal_content_:has(.header-title:has-text("Confirmation"))',
  );
  readonly confirmationCanxYesButton = this.confirmationCanxAdv.locator(
    'button.btn.mr-2.mcms-btn-solid-danger:has(span.mcms-btn-label:text("Yes"))',
  );

  readonly confirmationCanxConfirmYesButton =
    this.confirmationCanxAdvConfirm.locator(
      'button.btn.mr-2.mcms-btn-solid-danger:has(span.mcms-btn-label:text("Yes"))',
    );

  readonly cancelRescheduleReasonModel = this.page.locator(
    'div.modal-content#\\__BVID__34___BV_modal_content_:has(h2.header-title:text("Cancel/Reschedule Reason"))',
  );

  readonly cancelReasonDropDown =
    this.cancelRescheduleReasonModel.locator("#cancelReason");

  readonly multiDayEditTable = this.page.locator("table#vuetable");

  //primary filters
  //date selectors
  primaryFilterDateInput(date: string): Locator {
    return this.page.locator(
      `.vc-pane-container .vc-day.id-${date}.in-month .vc-day-content`,
    );
  }

  readonly primaryFilterJohInclusionLovToggleButon = this.page
    .getByRole("group", { name: /JOH \(Inclusion\) filter list/i })
    .locator('span[role="button"][aria-label="Close listbox"]');

  readonly primaryFilterClearAllLocalityFilterOptions = this.page
    .getByRole("group", { name: /locality filter list/i })
    .getByLabel("Clear all selected options");
  readonly primaryFilterLocalityDropdown = this.page.locator(
    'div.multiselect[role="combobox"][name="primaryFilter_locality_multiselectService"] > span[role="button"][title="Toggle"]',
  );
  readonly primaryFilterClearAllSessionTypeFilterOptions = this.page
    .getByRole("group", { name: /session type filter list/i })
    .getByLabel("Clear All selected options");
  readonly primaryFilterClearAllJohTierFilterOptions = this.page
    .getByRole("group", { name: /JOH Tier \(Inclusion\) filter/i })
    .getByLabel("Clear All selected options");
  readonly johTierInclusionToggleButton = this.page.locator(
    'div[role="combobox"][name="primaryFilter_employeeWorkTypesIn_multiselectLov"] .multiselect__custom-select[role="button"][title="Toggle"]',
  );

  getJohTierInclusionOption(optionText: string): Locator {
    return this.page
      .locator(
        "#primaryFilter_employeeWorkTypesIn_listbox .multiselect__element .multiselect__options-item",
      )
      .getByText(optionText, { exact: true });
  }

  readonly johTierInclusionTextbox = this.page.locator(
    'input.multiselect__input[aria-label="JOH Tiers (Inclusion)"][placeholder="Search an item"]',
  );
  readonly primaryFilterJohTierDropdown = this.page.locator(
    'div.multiselect[role="combobox"][name="primaryFilter_employeeWorkTypesIn_multiselectLov"] > span[role="button"][title="Toggle"]',
  );
  readonly primaryFilterJohTierFilter = this.page.locator(
    'div.multiselect[role="combobox"][name="primaryFilter_employeeWorkTypesIn_multiselectLov"] input.multiselect__input[aria-label="JOH Tier (Inclusion)"]',
  );

  async primaryFilterJohTierInput(searchText: string) {
    await this.primaryFilterJohTierFilter.fill(searchText);
  }
  readonly primaryFilterClearAllJohInclusionFilterOptions = this.page
    .getByRole("group", { name: /JOH \(Inclusion\) filter list/i })
    .getByLabel("Clear all selected options");
  readonly primaryFilterJohInclusionFilterInput = this.page
    .getByLabel("JOH (Inclusion) filter list")
    .getByText("Select an item");
  readonly primaryFilterJohInclusionTextbox = this.page.getByRole("textbox", {
    name: "JOH (Inclusion)",
  });
  readonly primaryFilterJohInclusionFirstOption = this.page
    .locator(
      "#primaryFilter_memTypesIn_listbox > li > .multiselect__option > .multiselect__options-container > .multiselect__options-checkmark",
    )
    .first();
  readonly primaryFilterApplyButton = this.page.getByRole("button", {
    name: "Apply filter criteria",
  });

  //advanced filters
  readonly advJurisdictionFilter = this.page.locator(
    'div.multiselect[role="combobox"][name="advancedFilter_jurisdictionTypes_multiselectService"]',
  );
  readonly johInclusionFilter = this.page.locator(
    'div.multiselect[role="combobox"][name="advancedFilter_memTypesIn_multiselectService"]',
  );
  readonly johExclusionFilter = this.page.locator(
    'div.multiselect[role="combobox"][name="advancedFilter_memTypeEx_multiselectService"]',
  );

  readonly johTierExclusionFilter = this.page.locator(
    'div.multiselect[role="combobox"][name="advancedFilter_employeeWorkTypeEx_multiselectLov"]',
  );

  readonly johTierExclusionListSelect = this.page.locator(
    'li[id^="advancedFilter_employeeWorkTypeEx_option_"]',
  );
  readonly johTierExclusionToggleClose = this.page.locator(
    'span[role="button"][aria-label="Close listbox"].multiselect__custom-select',
  );

  readonly johExlusionListOptions = this.page.locator(
    'ul#advancedFilter_memTypeEx_listbox li[role="option"] .multiselect__options-item',
  );

  constructor(page: Page) {
    super(page);
    this.sessionBookingPage = new SessionBookingPage(page);
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

  async scheduleHearingWithBasket(
    roomName: string,
    column: string,
    caseName: string,
  ): Promise<void> {
    await this.page.locator("#roomHS").click();
    await this.page.waitForTimeout(1000);
    await this.waitForLoad();
    const table: TableRow[] = await this.mapTable();
    const row = table.filter((row) => row.roomName === roomName)[0];
    await expect(row[column].locator(`${this.scheduleSelector}`)).toBeVisible();
    await row[column].locator(`${this.scheduleSelector}`).click();
    await expect(this.schedulePopup.basketItem).toBeVisible();
    await this.schedulePopup.basketItem.filter({ hasText: caseName }).click();
  }

  async filterTableByRoom(roomName: string): Promise<TableRow> {
    await this.waitForLoad();
    const table: TableRow[] = await this.mapTable();
    const row = table.filter((row) => row.roomName === roomName)[0];
    return row;
  }

  async clearDownSchedule(
    cancellationCode: string,
    room: string,
    date: string,
  ): Promise<void> {
    const scheduleButton = await this.bookingSessionId(room, date, this.page);

    //go to hearing schedule page
    await expect(this.sidebarComponent.sidebar).toBeVisible();
    await this.sidebarComponent.openHearingSchedulePage();

    //schedule hearing
    await this.waitForLoad();

    const releasedStatusCheck = this.page.locator(
      'button[title="Show booking details"] .hs-session-status',
      {
        hasText: "Released",
      },
    );

    if (await releasedStatusCheck.first().isVisible()) {
      await releasedStatusCheck.first().click();

      await this.waitForLoad();

      await expect
        .poll(async () => await scheduleButton.isVisible(), {
          intervals: [2_000],
          timeout: 10_000,
        })
        .toBeTruthy();

      await scheduleButton.click();
      await this.goToSessionDetailsButton.click();

      await expect
        .poll(
          async () => {
            return await this.sessionBookingPage.heading.isVisible();
          },
          {
            intervals: [2_000],
            timeout: 10_000,
          },
        )
        .toBeTruthy();

      //delete session from inside of session details page, if available

      await this.deleteSessionInSessionDetailsButton.waitFor({
        state: "visible",
        timeout: 10_000,
      });
      await this.deleteSessionInSessionDetailsButton.click();
      await this.page.locator("#cancellationCode").click();
      await this.page
        .locator("#cancellationCode")
        .selectOption(cancellationCode);
      await this.page.getByRole("button", { name: "Yes" }).click();

      //delete session from schedule page
      await expect(this.deleteSessionButton).toBeVisible();
      await this.deleteSessionButton.click();
      await expect(this.header).toBeVisible();
    }
  }

  async clearDownJohSession(dateFrom: string, dateTo: string): Promise<void> {
    await this.sidebarComponent.openHearingSchedulePage();
    await this.waitForLoad();
    await this.page
      .getByRole("tab", { name: this.tabNameJudicialOfficeHolders })
      .click();
    await this.waitForLoad();
    await this.applyPrimaryDateFilter(dateFrom, dateTo);
    await this.clearAllPrimaryFilters();
    await this.primaryFilterJohInclusionFilterInput.click();

    await this.primaryFilterJohInclusionTextbox.fill("automation");
    await this.primaryFilterJohInclusionFirstOption.click();
    await this.primaryFilterJohInclusionLovToggleButon.waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await this.primaryFilterJohInclusionLovToggleButon.click();
    await this.primaryFilterApplyButton.waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await this.primaryFilterApplyButton.click();
    await this.waitForLoad();

    await this.page.waitForTimeout(5000);
    const parentRow = this.bookingCell.locator("..").locator("..");
    const releasedCell = parentRow.locator("td", { hasText: "Released" });

    const releasedCellCount = await releasedCell.count();
    if (releasedCellCount === 0) return;

    const cellText = await releasedCell.first().textContent();
    if (!cellText?.includes("Released")) return;

    await this.page.locator('button.btn.p-0[title="Expand"]').first().click();
    await this.page
      .locator('div.droparea[role="button"], div.droparea[tabindex="0"]')
      .first()
      .click();
    await this.deleteSessionInstance();
  }

  async resetHearingScheduleToRoomsView(): Promise<void> {
    await this.page.locator("#roomHS").click();
    await this.page.waitForTimeout(1000);
    await this.waitForLoad();
  }

  async clearDownJohAndResetToRooms(
    dateFrom: string,
    dateTo: string,
  ): Promise<void> {
    await this.clearDownJohSession(dateFrom, dateTo);
    await this.resetHearingScheduleToRoomsView();
  }

  async deleteSessionInstance(): Promise<void> {
    await this.goToSessionDetailsButton.click();
    await this.deleteSessionInSessionDetailsButton.waitFor({
      state: "visible",
      timeout: 10_000,
    });
    if (await this.deleteSessionInSessionDetailsButton.isVisible()) {
      await this.deleteSessionInSessionDetailsButton.click();
      await this.page.locator("#cancellationCode").click();
      await this.page.locator("#cancellationCode").selectOption("CNCL");
      await this.page.getByRole("button", { name: "Yes" }).click();
    } else {
      return;
    }

    //delete session from schedule page
    await expect(this.deleteSessionButton).toBeVisible();
    await this.deleteSessionButton.click();
    await expect(this.header).toBeVisible();
  }

  async clearDownMultiDaySchedule(room: string): Promise<void> {
    // Navigate to the hearing schedule page and wait for the table to load.
    await expect(this.sidebarComponent.sidebar).toBeVisible();
    await this.sidebarComponent.openHearingSchedulePage();
    await this.waitForLoad();

    const releasedStatusCheck = this.page.locator(
      'button[title="Show booking details"] .hs-session-status',
      { hasText: "Released" },
    );

    // Only proceed if there are released (i.e., existing) sessions to clean up.
    if (await releasedStatusCheck.first().isVisible()) {
      // === First Pass: Delete existing multi-day listings ===
      await releasedStatusCheck.first().click();
      await this.waitForLoad();

      // Helper function: finds and waits for the first visible booking cell for this room.
      // Uses a partial match on the room name across any date column (doesn't require exact date).
      const locateCellWithData = async (): Promise<Locator> => {
        const cell = this.page
          .locator(`[id*="addBookingColor"][id*="${room}"]`)
          .first();
        await cell.waitFor({ state: "visible", timeout: 30_000 });
        return cell;
      };

      // Click the booking cell and enter the session details.
      await (await locateCellWithData()).click();
      await this.goToSessionDetailsButton.first().click();
      await expect
        .poll(async () => await this.sessionBookingPage.heading.isVisible(), {
          intervals: [2_000],
          timeout: 10_000,
        })
        .toBeTruthy();

      // Delete any existing multi-day listings for this session.
      await this.deleteExistingMultiDayListings();

      // === Second Pass: Delete multi-day listing placeholders ===
      // Navigate back to the hearing schedule page.
      await expect(this.sidebarComponent.sidebar).toBeVisible();
      await this.sidebarComponent.openHearingSchedulePage();

      if (await releasedStatusCheck.first().isVisible()) {
        await releasedStatusCheck.first().click();
        await this.waitForLoad();
      }

      // Click the booking cell again to access any remaining placeholder sessions.
      await (await locateCellWithData()).click();
      await this.goToSessionDetailsButton.first().click();
      await expect
        .poll(async () => await this.sessionBookingPage.heading.isVisible(), {
          intervals: [2_000],
          timeout: 10_000,
        })
        .toBeTruthy();

      // Delete any placeholder sessions (recurring session instances that haven't been booked yet).
      await this.deleteMultiDayListingsPlaceholders();
    }
  }

  async clickCartAllSessions(room: string) {
    const button = this.page.locator(
      `button[title="Cart all sessions of room: ${room}"][aria-label="Cart all sessions of room: ${room}"]`,
    );

    await expect(
      button,
      "Cart All Sessions button should be visible",
    ).toBeVisible();
    await button.click();
  }

  async deleteExistingMultiDayListings(): Promise<void> {
    if (await this.multiDayLink.isVisible()) {
      await this.multiDayLink.click();
      await expect(this.multiDaysEditPageHeader).toBeVisible();
      await this.selectAllCancelListingsCheckbox.click();
      await expect(this.cancelListingButton.first()).toBeVisible();
      await this.cancelListingButton.first().click();
      await expect(this.confirmationCanxAdv).toBeVisible();
      await this.confirmationCanxYesButton.click();
      await expect(this.cancelRescheduleReasonModel).toBeVisible();
      await this.cancelReasonDropDown.selectOption("CNCL");

      await expect(this.confirmationCanxAdvConfirm).toBeAttached();
      await expect(this.confirmationCanxAdvConfirm).toBeVisible();
      await expect(this.confirmationCanxConfirmYesButton).toBeVisible();
      await this.confirmationCanxConfirmYesButton.click();

      //confirm no data in table
      await expect(this.multiDayEditTable).toBeVisible();
      await expect(this.multiDayEditTable).toContainText("No Data Available");
    } else {
      return;
    }
  }

  async deleteMultiDayListingsPlaceholders(): Promise<void> {
    if (await this.deleteHearingButton.isVisible()) {
      await this.deleteHearingButton.click();
      await expect(this.deleteSessionBookingModalHeader).toBeVisible();
      await expect(this.deleteSessionBookingModalHeader).toContainText(
        "Delete Session Booking",
      );
      await expect(this.clearAllASessionsRadioButton).toBeVisible();
      await this.clearAllASessionsRadioButton.click();
      await expect(this.clearAllSessionsOkButton).toBeVisible();
      await this.clearAllSessionsOkButton.click();

      await this.waitForLoad();
    } else {
      return;
    }
  }

  async bookingSessionId(roomName: string, date, page) {
    const id = `[id*="addBookingColor"][id*="${roomName}"][id*="${date}"]`;
    return page.locator(id);
  }

  async applyPrimaryDateFilter(dateTo: string, dateFrom: string) {
    await this.primaryFilterToggleButton.click();
    await this.primaryFilterFromDateInput.click();
    await this.waitForLoad();
    await this.primaryFilterDateInput(dateFrom).click();
    await this.waitForLoad();
    await this.primaryFilterDateInput(dateTo).click();
    await this.waitForLoad();
    await this.applyPrimaryFilterButton.click();
    await this.waitForLoad();
  }

  async clearAllPrimaryFilters() {
    await this.waitForLoad();
    await this.primaryFilterClearAllLocalityFilterOptions.click();
    await this.primaryFilterClearAllSessionTypeFilterOptions.click();
    await this.primaryFilterClearAllJohTierFilterOptions.click();
    await this.primaryFilterClearAllJohInclusionFilterOptions.click();
  }

  async primaryFilterSelectLocality(locality: string) {
    await this.primaryFilterLocalityDropdown.click();
    const option = this.page.getByRole("option", {
      name: locality,
      exact: true,
    });
    await option.waitFor({ state: "visible", timeout: 5000 });
    await option.click();
  }

  /**
   * Polls for an element to become visible within a timeout.
   * @param locator The Playwright Locator to check.
   * @param timeoutMs Maximum time to wait in ms (default 10_000).
   * @param intervalMs Polling interval in ms (default 500).
   * @returns Promise<boolean> true if visible, false if not.
   */
  async waitForElementVisible(
    locator: Locator,
    timeoutMs = 10_000,
    intervalMs = 500,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await locator.isVisible()) {
        return true;
      }
      await this.page.waitForTimeout(intervalMs);
    }
    return false;
  }
}
