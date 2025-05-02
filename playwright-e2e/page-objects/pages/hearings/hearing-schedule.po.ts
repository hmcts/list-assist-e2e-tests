import { Locator, Page, expect } from '@playwright/test';
import { Base } from '../../base';
import { SessionBookingPage } from './session-booking.po.ts';

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

  readonly container = this.page.locator('#pageContent');
  readonly header = this.page.locator('#hs-header');
  readonly tabList = this.page.locator('#joh-tabs');
  readonly table = this.page.locator('#membersOrRoomsTable');
  readonly tableHeaders = this.table.locator('thead th');
  readonly schedulePopup = {
    createSession: this.page.locator('#createSession'),
    roomUnavailability: this.page.locator('#createTimeOffOrRoomUnavailability'),
    basketItem: this.page.locator('#venueBookingList').getByLabel('Go to session details page'),
  };
  readonly scheduleSelector = 'div[booking="item"]';
  readonly siblingRow = '+ tr';
  readonly separatorValue = '--------------------------';
  readonly confirmListingReleasedStatus = this.page.locator('button[title="Show booking details"] .hs-session-status', {
    hasText: 'Released',
  });

  //scheduling
  readonly goToSessionDetailsButton = this.page.getByRole('button', {
    name: 'Go to Session Details screen',
  });
  readonly deleteSessionButton = this.page.getByRole('button', {
    name: 'Delete',
  });
  readonly deleteSessionInSessionDetailsButton = this.page.locator('#handleListingImgId').nth(1);

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
    const rows = await this.table.locator('tbody > tr').all();

    for (const row of rows) {
      // Filter out expanded rows
      const firstCell = (await row.locator('td').first().textContent())?.trim();
      if (firstCell?.includes(this.separatorValue) || !firstCell) continue;

      const roomName = await row.locator('td').first().locator('b').textContent();
      if (!roomName) {
        throw new Error('Row or room not found');
      }

      table.push({
        roomName: roomName,
        row: row,
        columnOne: row.locator('td').nth(1),
        columnTwo: row.locator('td').nth(2),
        columnThree: row.locator('td').nth(3),
        columnFour: row.locator('td').nth(4),
        columnFive: row.locator('td').nth(5),
      });
    }
    return table;
  }

  async scheduleHearingWithBasket(roomName: string, column: string, caseName: string): Promise<void> {
    const table: TableRow[] = await this.mapTable();
    const row = table.filter((row) => row.roomName === roomName)[0];
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

  async clearDownSchedule(cancellationCode: string, room: string, location: string): Promise<void> {
    const scheduleButton = this.page.locator('div.droparea span.sessionHeader', { hasText: room });

    //go to hearing schedule page
    await expect(this.sidebarComponent.sidebar).toBeVisible();
    await this.sidebarComponent.openHearingSchedulePage();

    //schedule hearing
    await this.waitForLoad();

    console.log(location);
    // const bookingSessionWithCaseName = this.page.locator('div.draggable', { hasText: location });
    const releasedStatusCheck = this.page.locator('button[title="Show booking details"] .hs-session-status', {
      hasText: 'Released',
    });

    if (await releasedStatusCheck.isVisible()) {
      await releasedStatusCheck.click();
      // await expect(bookingSessionWithCaseName).toBeVisible();

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
        await this.page.locator('#cancellationCode').click();
        await this.page.locator('#cancellationCode').selectOption(cancellationCode);
        await this.page.getByRole('button', { name: 'Yes' }).click();
      }
      //delete session from schedule page
      await expect(this.deleteSessionButton).toBeVisible();
      await this.deleteSessionButton.click();
      await expect(this.header).toBeVisible();
    }
  }
}
