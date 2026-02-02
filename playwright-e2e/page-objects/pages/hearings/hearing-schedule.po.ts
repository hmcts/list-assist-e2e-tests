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

    if (await this.confirmListingReleasedStatus.isVisible()) {
      await this.confirmListingReleasedStatus.click();

      await expect
        .poll(
          async () => {
            return await scheduleButton.isVisible();
          },
          {
            intervals: [2_000],
            timeout: 10_000,
          },
        )
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
      if (await this.deleteSessionInSessionDetailsButton.isVisible()) {
        await this.deleteSessionInSessionDetailsButton.click();
        await this.page.locator("#cancellationCode").click();
        await this.page
          .locator("#cancellationCode")
          .selectOption(cancellationCode);
        await this.page.getByRole("button", { name: "Yes" }).click();
      }

      //delete session from schedule page
      await expect(this.deleteSessionButton).toBeVisible();
      await this.deleteSessionButton.click();
      await expect(this.header).toBeVisible();
    }
  }

  async clearDownMultiDaySchedule(room: string, date: string): Promise<void> {
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
      await this.goToSessionDetailsButton.first().click();

      await expect
        .poll(async () => await this.sessionBookingPage.heading.isVisible(), {
          intervals: [2_000],
          timeout: 10_000,
        })
        .toBeTruthy();

      await this.deleteExistingMultiDayListings();

      //go to hearing schedule page
      await expect(this.sidebarComponent.sidebar).toBeVisible();
      await this.sidebarComponent.openHearingSchedulePage();

      if (await releasedStatusCheck.first().isVisible()) {
        await releasedStatusCheck.first().click();

        await this.waitForLoad();

        await expect
          .poll(async () => await scheduleButton.isVisible(), {
            intervals: [2_000],
            timeout: 10_000,
          })
          .toBeTruthy();
      }

      await scheduleButton.click();
      await this.goToSessionDetailsButton.first().click();

      await expect
        .poll(async () => await this.sessionBookingPage.heading.isVisible(), {
          intervals: [2_000],
          timeout: 10_000,
        })
        .toBeTruthy();

      await this.deleteMultiDayListingsPlaceholders();
    }
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
}
