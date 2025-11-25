import { Page, expect } from "@playwright/test";
import { Base } from "../base";

export class Cath extends Base {
  readonly CONSTANTS = {
    CATH_TEST_URL:
      "https://pip-frontend.test.platform.hmcts.net/summary-of-publications?locationId=",
    LOCATION_ID_NEWPORT_SOUTH_WALES_CC_FC: "2000",
    LIST_JURISDICTION_CIVIL_AND_FAMILY: "Civil and Family",
    LIST_TYPE_DAILY_CAUSE_LIST: "Daily Cause List",
    LIST_TYPE_CIVIL_CAUSE_LIST: "Civil Cause List",
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
    case_name: string,
    case_type: string,
    hearingType: string,
    service: string,
    location: string,
    duration: string,
    applicantPetitioner: string,
    respondent: string,
  ) {
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
        case_name,
        case_type,
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
        case_name,
        case_type,
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

  buildDailyCauseListArray(
    time: string,
    hmctsCaseNumber: string,
    case_name: string,
    case_type: string,
    service: string,
    location: string,
    duration: string,
    applicantPetitioner: string,
    respondent: string,
  ) {
    return [
      { header: "Time", value: time },
      { header: "Case ref", value: hmctsCaseNumber },
      { header: "Case name", value: case_name },
      { header: "Case type", value: case_type },
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
    case_name: string,
    case_type: string,
    hearingType: string,
    location: string,
    duration: string,
  ) {
    return [
      { header: "Time", value: time },
      { header: "Case ref", value: hmctsCaseNumber },
      { header: "Case name", value: case_name },
      { header: "Case type", value: case_type },
      { header: "Hearing type", value: hearingType },
      { header: "Location", value: location },
      { header: "Duration", value: duration },
    ];
  }
}
