import { Locator, Page, expect } from "@playwright/test";
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

export class HearingSchedulePage extends Base {
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

  constructor(page: Page) {
    super(page);
  }

  async waitForNavigation(): Promise<void> {
    await expect
      .poll(
        async () => {
          return await this.table.isVisible();
        },
        {
          message: "Hearing Schedule table is not visible",
          timeout: 10_000,
        }
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
    caseName: string
  ): Promise<void> {
    const table: TableRow[] = await this.mapTable();
    const row = table.filter((row) => row.roomName === roomName)[0];
    await row[column].locator(`${this.scheduleSelector}`).click();
    await expect(this.schedulePopup.basketItem).toBeVisible();
    await this.schedulePopup.basketItem.filter({ hasText: caseName }).click();
  }

  async filterTableByRoom(roomName: string): Promise<TableRow> {
    await this.waitForNavigation();
    const table: TableRow[] = await this.mapTable();
    const row = table.filter((row) => row.roomName === roomName)[0];
    return row;
  }
}
