import { Page, expect, Locator } from "@playwright/test";
import { Base } from "../base";

export class Cath extends Base {
  readonly CONSTANTS = {
    CATH_TEST_URL:
      "https://pip-frontend.test.platform.hmcts.net/summary-of-publications?locationId=",
    LOCATION_ID_NEWPORT_SOUTH_WALES_CC_FC: "2000",
    LIST_JURISDICTION_CIVIL_AND_FAMILY: "Civil and Family",
    LIST_TYPE_DAILY_CAUSE_LIST: "Daily Cause List",
  };

  constructor(page: Page) {
    super(page);
  }

  async cathUrlConstruction(url: string, locationId: string) {
    return url + locationId;
  }

  async goToCathUrlAndConfirmReportDisplayed(
    cathUrl: string,
    reportName: string,
  ) {
    await this.page.goto(cathUrl);

    const header: Locator = this.page.locator("h1.govuk-heading-l", {
      hasText: "What do you want to view",
    });
    await expect(header).toBeVisible();
    const link: Locator = this.page.locator("a.das-search-results__link", {
      hasText: reportName,
    });
    await expect(link).toBeVisible();
  }
}
