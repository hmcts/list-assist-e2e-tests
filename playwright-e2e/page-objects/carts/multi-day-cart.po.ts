import { Page, expect } from "@playwright/test";
import { Base } from "./../base";

export class MultiDayCartPage extends Base {
  readonly multiDaysCartHeader = this.page.locator(
    "div.card.mcms-card-margins.mcms-card-shadows h1.header-title",
    { hasText: "Multi Days Cart" },
  );
  readonly bulkListTable = this.page.locator("table#vuetable.table.mcms-thead");
  readonly bulkListCheckBox = this.page.getByRole("checkbox", {
    name: "Check/uncheck to add all",
  });
  readonly submitButton = this.page.locator("#submitSession");
  readonly applyFilterButton = this.page.locator("#applyFilter");
  readonly selectHearingType = this.page.getByRole("combobox",{ name: /Hearing Type/i });
  readonly selectCaseBoxSelect = this.page.locator(".multiselect__select");
  readonly listingRequirementsDropDown = this.page.locator(
    'label.select-header:has-text("Select a Listing Requirement") + div.multiselect',
  );

  readonly listingRequirementsOption = this.listingRequirementsDropDown.locator(
    ".multiselect .multiselect__single",
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

  // Label locators for session/duration summary
  readonly listingRequirementsLabel = this.page.getByText(/^Listing requirements:/);
  readonly requiredLabel = this.page.getByText(/^Required:/);
  readonly listedLabel = this.page.getByText(/^Listed:/);
  readonly currentlySelectedLabel = this.page.getByText(/^Currently selected:/);
  readonly remainingToAllocateLabel = this.page.getByText(/^Remaining to allocate:/);

  readonly cancelListingsButton = this.page.getByRole("button", { name: "Cancel Listings" });
  readonly  cancelFlag1 = this.page.locator('span[role="checkbox"][aria-labelledby="1_cancelFlag-label"]');
  readonly  cancelFlag2 = this.page.locator('span[role="checkbox"][aria-labelledby="2_cancelFlag-label"]');


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
    await expect
      .poll(
        async () => {
          await this.page.locator(".multiselect__select").first().isVisible();
          await this.page.locator(".multiselect__select").first().click();
          return await this.page
            .locator(".multiselect__option", { hasText: caseName })
            .first()
            .isVisible();
        },
        { intervals: [1_000], timeout: 10_000 },
      )
      .toBeTruthy();

    await this.page
      .locator(".multiselect__option", { hasText: caseName })
      .first()
      .click();
  }

  async waitForlistingRequirementsSelectionToBePopulated(value: string) {
    await expect
      .poll(
        async () =>
          await this.page
            .locator("span", { hasText: value })
            .first()
            .isVisible(),
        { intervals: [1000], timeout: 20_000 },
      )
      .toBeTruthy();
  }

  async assertLabelValue(labelLocator, expected) {
    await expect(labelLocator).toContainText(expected);
  }

  async assertMultiDayCartDurations(expected: {
    listingRequirements: string;
    required: string;
    listed: string;
    currentlySelected?: string;
    remainingToAllocate: string;
  }) {
    const normalise = (text: string | null | undefined) =>
        text?.replace(/\s+/g, ' ').trim() ?? '';

    await expect.poll(async () =>
        normalise(await this.listingRequirementsLabel.textContent())
    ).toContain(expected.listingRequirements);

    await expect.poll(async () =>
        normalise(await this.requiredLabel.textContent())
    ).toContain(expected.required);

    await expect.poll(async () =>
        normalise(await this.listedLabel.textContent())
    ).toContain(expected.listed);

    if (expected.currentlySelected !== undefined) {
      await expect.poll(async () =>
          normalise(await this.currentlySelectedLabel.textContent())
      ).toContain(expected.currentlySelected);
    }

    await expect.poll(async () =>
        normalise(await this.remainingToAllocateLabel.textContent())
    ).toContain(expected.remainingToAllocate);
  }

  /**
   * Handles the listing validation popup: selects the override reason and clicks SAVE & CONTINUE LISTING.
   * @param validationPopup The popup Page object
   * @param overrideReason The label of the override reason to select
   */
  async handleListingValidationPopup(validationPopup: import('@playwright/test').Page, overrideReason: string) {
    await validationPopup.waitForLoadState("domcontentloaded");
    await validationPopup
      .getByRole("combobox", { name: "Reason to override rule/s *" })
      .selectOption({ label: overrideReason });
    await validationPopup
      .getByRole("button", { name: "SAVE & CONTINUE LISTING" })
      .click();
  }

}
