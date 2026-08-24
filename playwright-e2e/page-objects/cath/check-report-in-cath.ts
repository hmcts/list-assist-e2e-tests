import { Page, expect } from "@playwright/test";
import { Base } from "../base";

export type ExpectedCathListRows = {
  time: string;
  caseId: string;
  caseName: string;
  caseType: string;
  hearingType: string;
  duration: string;
};

export class Cath extends Base {
  readonly CONSTANTS = {
    CATH_TEST_URL:
      "https://pip-frontend.test.platform.hmcts.net/summary-of-publications?locationId=",
    LOCATION_ID_NEWPORT_SOUTH_WALES_CC_FC: "2000",
    LIST_JURISDICTION_CIVIL_AND_FAMILY: "Civil and Family",
    LIST_TYPE_DAILY_CAUSE_LIST: "Daily Cause List",
    LIST_TYPE_CIVIL_CAUSE_LIST: "Civil Cause List",
    LIST_CIVIL_DAILY_CAUSE_LIST: "Civil Daily Cause List",
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
    reportType: string,
    cathUrl: string,
    reportName: string,
    time: string,
    hmctsCaseNumber: string,
    caseName: string,
    caseType: string,
    hearingType: string,
    service: string,
    location: string,
    duration: string,
    applicantPetitioner: string,
    respondent: string,
  )
  {
    //go to url
    await this.page.goto(cathUrl);

    //check heading is correct
    await expect(this.summaryGovUkHeading).toBeVisible();

    //check hyperlink with correct report name is visible and click it
    await expect(this.reportLink.filter({ hasText: reportName })).toBeVisible();
    await this.reportLink.filter({ hasText: reportName }).click();

    //check that the court name is displayed on the report page
    const courtHeader = this.page.locator("h1.govuk-heading-l.site-address", {
      hasText: "Newport (South Wales) County Court and Family Court",
    });
    await expect(courtHeader).toBeVisible();

    const table = this.page.locator(
      "div.govuk-accordion__section--expanded table.govuk-table",
    );

    let expected;
    if (reportType === this.CONSTANTS.LIST_TYPE_DAILY_CAUSE_LIST) {
      expected = this.buildDailyCauseListArray(
        time,
        hmctsCaseNumber,
        caseName,
        caseType,
        service,
        location,
        duration,
        applicantPetitioner,
        respondent,
      );
    } else if (reportType === this.CONSTANTS.LIST_TYPE_CIVIL_CAUSE_LIST) {
      expected = this.buildCivilCauseListArray(
        time,
        hmctsCaseNumber,
        caseName,
        caseType,
        hearingType,
        location,
        duration,
      );
    } else {
      throw new Error(`Unsupported report type: ${reportType}`);
    }

    const headerCells = table.locator("thead tr th");
    const firstRowCells = table.locator("tbody tr").first().locator("td");

    for (let i = 0; i < expected.length; i++) {
      await expect(headerCells.nth(i)).toHaveText(expected[i].header);
      await expect(firstRowCells.nth(i)).toHaveText(expected[i].value);
    }
  }


  async assertCivilPipReportValues(
      cathUrl: string,
      reportName: string,
      siteName: string,
      courtAddress: string,
      location: string,
      expectedRows: ExpectedCathListRows[],
  ) {

    //go to url
    await this.page.goto(cathUrl);

    //check heading is correct
    await expect(this.summaryGovUkHeading).toBeVisible();

    //check hyperlink with correct report name is visible and click it
    await expect(this.reportLink.filter({ hasText: reportName })).toBeVisible();
    await this.reportLink.filter({ hasText: reportName }).click();

    //check that the court name is displayed on the report page

    await expect(this.page.getByText(siteName, { exact: true })).toBeVisible();
    await expect(
        this.page.getByText(courtAddress, { exact: true }),
    ).toBeVisible();

    await expect(
        this.page.getByText(location, { exact: true }),
    ).toBeVisible();

    const reportTable = this.page.locator("table.govuk-table").filter({
      has: this.page.getByRole("columnheader", {
        name: /Case ID/,
      }),
    });

    await expect(reportTable).toHaveCount(1);
    await expect(reportTable).toBeVisible();

    const headerCells = reportTable.locator("thead th");

    await expect(headerCells).toHaveCount(7);
    await expect(headerCells.nth(0)).toContainText("Time");
    await expect(headerCells.nth(1)).toContainText("Case ID");
    await expect(headerCells.nth(2)).toContainText("Case name");
    await expect(headerCells.nth(3)).toContainText("Case type");
    await expect(headerCells.nth(4)).toContainText("Hearing type");
    await expect(headerCells.nth(5)).toContainText("Location");
    await expect(headerCells.nth(6)).toContainText("Duration");

    const dataRows = reportTable.locator("tbody tr");

    await expect(dataRows).toHaveCount(expectedRows.length);

    for (let index = 0; index < expectedRows.length; index++) {
      const expectedRow = expectedRows[index];
      const cells = dataRows.nth(index).locator("td");

      await expect(cells).toHaveCount(7);

      await expect(cells.nth(0)).toContainText(expectedRow.time);
      await expect(cells.nth(1)).toContainText(expectedRow.caseId);
      await expect(cells.nth(2)).toContainText(expectedRow.caseName);
      await expect(cells.nth(3)).toContainText(expectedRow.caseType);
      await expect(cells.nth(4)).toContainText(expectedRow.hearingType);
      await expect(cells.nth(5)).toHaveText(/^\s*$/);
      await expect(cells.nth(6)).toContainText(expectedRow.duration);
    }
  }



  buildDailyCauseListArray(
    time: string,
    hmctsCaseNumber: string,
    caseName: string,
    caseType: string,
    service: string,
    location: string,
    duration: string,
    applicantPetitioner: string,
    respondent: string,
  ) {
    return [
      { header: "Time", value: time },
      { header: "Case ref", value: hmctsCaseNumber },
      { header: "Case name", value: caseName },
      { header: "Case type", value: caseType },
      { header: "Hearing type", value: service },
      { header: "Location", value: location },
      { header: "Duration", value: duration },
      { header: "Applicant/Petitioner", value: applicantPetitioner },
      { header: "Respondent", value: respondent },
    ];
  }

  buildCivilCauseListArray(
    time: string,
    hmctsCaseNumber: string,
    caseName: string,
    caseType: string,
    hearingType: string,
    location: string,
    duration: string,
  ) {
    return [
      { header: "Time", value: time },
      { header: "Case ref", value: hmctsCaseNumber },
      { header: "Case name", value: caseName },
      { header: "Case type", value: caseType },
      { header: "Hearing type", value: hearingType },
      { header: "Location", value: location },
      { header: "Duration", value: duration },
    ];
  }
}
