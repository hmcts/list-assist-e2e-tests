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

  readonly summaryGovUkHeading = this.page.locator("h1.govuk-heading-l", {
    hasText: "What do you want to view",
  });
  readonly reportLink = this.page.locator("a.das-search-results__link");

  constructor(page: Page) {
    super(page);
  }

  async cathUrlConstruction(url: string, locationId: string) {
    return url + locationId;
  }

  async goToCathUrlAndConfirmReportDisplayed(
    cathUrl: string,
    reportName: string,
    time: string,
    hmctsCaseNumber: string,
    case_name: string,
    case_type: string,
    service: string,
    location: string,
    duration: string,
  ) {
    //go to url
    await this.page.goto(cathUrl);

    //check heading is correct
    await expect(this.summaryGovUkHeading).toBeVisible();

    //check hyperlink with correct report name is visible and click it
    await expect(this.reportLink.filter({ hasText: reportName })).toBeVisible();
    await this.reportLink.filter({ hasText: reportName }).click();

    //check that the court name is displayed on the report pagei
    const courtHeader = this.page.locator("h1.govuk-heading-l.site-address", {
      hasText: "Newport (South Wales) County Court and Family Court",
    });
    await expect(courtHeader).toBeVisible();

    const table = this.page.locator(
      "div.govuk-accordion__section--expanded table.govuk-table",
    );

    // Array of expected headers and corresponding first row values
    const expected = [
      { header: "Time", value: time },
      { header: "Case ref", value: hmctsCaseNumber },
      { header: "Case name", value: case_name },
      { header: "Case type", value: case_type },
      { header: "Hearing type", value: service },
      { header: "Location", value: location },
      { header: "Duration", value: duration },
    ];

    const headerCells = table.locator("thead tr th");
    const firstRowCells = table.locator("tbody tr").first().locator("td");

    for (let i = 0; i < expected.length; i++) {
      await expect(headerCells.nth(i)).toHaveText(expected[i].header);
      await expect(firstRowCells.nth(i)).toHaveText(expected[i].value);
    }
  }
}
