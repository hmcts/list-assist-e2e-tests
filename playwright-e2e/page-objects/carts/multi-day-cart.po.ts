import { Page, expect } from "@playwright/test";
import { Base } from "./../base";

export class MultiDayCartPage extends Base {
  readonly multiDaysCartHeader = this.page.locator(
    "div.card-header h1.header-title",
  );
  readonly bulkListTable = this.page.locator("table#vuetable.table.mcms-thead");
  readonly bulkListCheckBox = this.page.locator("#checkAllBulk_checkmark");
  readonly submitButton = this.page.locator("#submitSession");

  constructor(page: Page) {
    super(page);
  }

  async assertMultiDaysCartPageHasLoaded() {
    await expect
      .poll(
        async () => {
          return await this.multiDaysCartHeader.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await expect(this.multiDaysCartHeader).toHaveText("Multi Days Cart");
    await expect(this.bulkListTable).toBeVisible();
  }

  async assertAllLinesInMultiDaysCartTableHaveCorrectLocalityAndLocation(
    expectedLocality: string,
    expectedLocation: string,
  ) {
    const rows = await this.bulkListTable.locator("tbody tr").count();
    for (let i = 0; i < rows; i++) {
      // Use nth-child(2) for Locality and nth-child(3) for Location
      const localityLocator = this.bulkListTable.locator(
        `tbody tr:nth-child(${i + 1}) td:nth-child(2)`,
      );
      const locationLocator = this.bulkListTable.locator(
        `tbody tr:nth-child(${i + 1}) td:nth-child(3)`,
      );
      await expect(localityLocator).toHaveText(expectedLocality);
      await expect(locationLocator).toHaveText(expectedLocation);
    }
  }
}
