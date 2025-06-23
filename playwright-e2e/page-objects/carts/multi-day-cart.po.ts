import { Page, expect } from "@playwright/test";
import { Base } from "./../base";

export class MultiDayCartPage extends Base {
  readonly multiDaysCartHeader = this.page.locator(
    "div.card.mcms-card-margins.mcms-card-shadows h1.header-title",
    { hasText: "Multi Days Cart" },
  );
  readonly bulkListTable = this.page.locator("table#vuetable.table.mcms-thead");
  readonly bulkListCheckBox = this.page.locator("#checkAllBulk_checkmark");
  readonly submitButton = this.page.locator("#submitSession");
  readonly applyFilterButton = this.page.locator("#applyFilter");

  readonly selectCaseBoxSelect = this.page.locator(
    'label.select-header:has-text("Select a Case") + div.multiselect',
  );
  readonly listingRequirementsDropDown = this.page.locator(
    'label.select-header:has-text("Select a Listing Requirement") + div.multiselect',
  );

  readonly listingRequirementsOption = this.listingRequirementsDropDown.locator(
    ".multiselect__single",
  );

  //validation popup
  readonly okbuttonOnValidationPopup = this.page.locator(
    "#confirmMultiDayValidationPopup",
  );

  //addition listing data page
  readonly additionalListingDataPageHeader = this.page.locator(
    "div.card-header h1.header-title",
    { hasText: "Additional Listing Data" },
  );

  readonly createListingsOnlyButton = this.page.locator(
    "#saveAdditionalListingData",
  );

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

    await expect(this.bulkListTable).toBeVisible();
  }

  async assertAllLinesInMultiDaysCartTableHaveCorrectLocalityAndLocation(
    expectedLocality: string,
    expectedLocation: string,
  ) {
    const rows = await this.bulkListTable.locator("tbody tr").count();
    for (let i = 0; i < rows; i++) {
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

  async selectCaseFromSelectDropDown(caseName: string) {
    await this.selectCaseBoxSelect.click();

    const options = this.selectCaseBoxSelect.locator(
      "div.multiselect__content-wrapper",
    );
    await expect(options).toBeVisible();

    const caseOption = options
      .locator(".multiselect__element span.multiselect__option")
      .filter({ hasText: caseName });
    await expect(caseOption).toBeVisible();
    await caseOption.click();
  }

  async waitForlistingRequirementsSelectionToBePopulated(value: string) {
    await expect
      .poll(
        async () => {
          const text = await this.listingRequirementsOption.textContent();
          return text && text.trim() !== "Select One";
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await expect(this.listingRequirementsOption).toContainText(value);
  }
}
