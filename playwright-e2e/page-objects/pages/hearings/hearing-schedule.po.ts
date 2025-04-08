import { Locator, Page, expect } from "@playwright/test";
import { Base } from "../../base";
import { TestData } from "../../../test-data.ts";

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

  //scheduling
  readonly scheduleButton10amTo6pmReleased = this.page.getByRole("button", {
    name: "10:00-16:00 - Released",
  });
  readonly scheduleButton10amTo6pmLeicester = this.page.locator(
    "div.droparea span.sessionHeader",
    { hasText: TestData.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7 },
  );
  readonly goToSessionDetailsButton = this.page.getByRole("button", {
    name: "Go to Session Details screen",
  });
  readonly deleteSessionButton = this.page.getByRole("button", {
    name: "Delete",
  });
  readonly deleteSessionInSessionDetailsButton = this.page
    .locator("#handleListingImgId")
    .nth(1);

  //listing iframe
  readonly listingHearingDropdown = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole("button", { name: "Please Choose..." });
  readonly listingHearingApplicationSelect = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole("list")
    .getByRole("option", {
      name: "Application",
      exact: true,
    });
  readonly listingIframeSaveButton = this.page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole("button", {
      name: "Save",
      exact: true,
    });

  constructor(page: Page) {
    super(page);
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

  async clearDownSchedule(cancellationCode: string) {
    //go to hearing schedule page
    await expect(this.sidebarComponent.sidebar).toBeVisible();
    await this.sidebarComponent.openHearingSchedulePage();

    //schedule hearing
    await this.waitForLoad();

    if (await this.scheduleButton10amTo6pmLeicester.isVisible()) {
      await this.scheduleButton10amTo6pmLeicester.click();
      await this.goToSessionDetailsButton.click();
      await this.page.waitForTimeout(1000);

      //delete session from inside of session details page, if available
      if (await this.deleteSessionInSessionDetailsButton.isVisible()) {
        await this.deleteSessionInSessionDetailsButton.click();
        await this.page.locator("#cancellationCode").click();
        await this.page
          .locator("#cancellationCode")
          .selectOption(cancellationCode);
        await this.page.getByRole("button", { name: "Yes" }).click();
        await this.page.waitForTimeout(3000);
        console.log("Session removed");
      }

      await this.deleteSessionButton.click();
      await this.page.waitForTimeout(5000);
    } else {
      console.log("No sessions to be cleared. No action needed");
    }
  }
}
