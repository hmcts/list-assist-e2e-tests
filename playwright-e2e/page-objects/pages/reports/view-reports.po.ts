import { Page, expect, Locator } from "@playwright/test";
import { Base } from "../../base";

export class ViewReportsPage extends Base {
  readonly CONSTANTS = {
    LOCALITY_LEICESTER_COMBINED_COURT: "Leicester Combined Court",
    LOCATION_LEICESTER_COUNTY_COURTROOM_07: "Leicester County Courtroom 07",
    CASE_LISTING_REGION_WALES: "Wales",
    CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS:
      "Wales Civil, Family and Tribunals",
    CASE_LISTING_LOCATION_LEICESTER_CC_7: "Leicester County Courtroom 07",
    CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT:
      "Pontypridd County Court and",
    CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1:
      "Newport (South Wales) Chambers 01",
    JURISDICTION_CIVIL: "Civil",
    SERVICE_DAMAGES: "Damages",

    SESSION_JOH: "Before: Matthew Dunn (P)",
    LOCALITY_PONTYPRIDD_COUNTY_COURT_AND_FAMILY_COURT:
      "Pontypridd County Court and Family Court",
    LOCALITY_CARDIFF_CIVIL_AND_FAMILY_JUSTICE_CENTRE:
      "Cardiff Civil and Family Justice Centre",
    CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1: "Pontypridd Courtroom 01",
    LIST_TYPE_DAILY_CAUSE_LIST: "DAILY CAUSE LIST",
    CASE_LISTING_ADDRESS_PONTYPRIDD:
      "The Courthouse, Courthouse Street, Pontypridd",

    REPORT_HEADING_WELSH_DAILY_CAUSE_LIST:
      "RHESTR ACHOS DYDDIOL, DAILY CAUSE LIST",
    CASE_LISTING_ADDRESS_PONTYPRIDD_BILINGUAL:
      "Adeilad y Llys, Courthouse Street, Pontypridd, CF37 1JR, The Courthouse, Courthouse Street, Pontypridd, CF37 1JR",
    CASE_LISTING_LOCATION_PONTYPRIDD_WELSH:
      "Ystafell Llys 01 Pontypridd, Pontypridd Courtroom 01",

    REPORT_SUBMENU_WELSH_EXTERNAL_HEARING_LIST:
      "External Hearing List Welsh v2.0 (SRSS)",
    REPORT_SUBMENU_INTERNAL_HEARING_LIST: "Opens Internal Hearing List",
    REPORT_SUBMENU_EXTERNAL_HEARING_LIST: "External Hearing List v2.0 (SSRS)",

    //data export report
    DATA_EXPORT_REPORT_JOH_SALLY_LAVERNE: "DJ Sally Laverne",
    DATA_EXPORT_REPORT_COURT_NEWPORT_CCFC:
      "Newport (South Wales) County Court and Family Court",
    DATA_EXPORT_REPORT_ROOM_NEWPORT_CHAMBERS_01:
      "Newport (South Wales) Chambers 01",
    DATA_EXPORT_REPORT_SESSION_TYPE_ADHOC_AS_DIRECTED: "Adhoc (as directed)",
    DATA_EXPORT_REPORT_JURISDICTION_FAMILY: "Family",
    DATA_EXPORT_REPORT_CASE_TYPE_SMALL_CLAIMS: "Small Claims",
  };

  //reports menu
  readonly reportsMenu = this.page.locator("#reports_menuItem");
  private reportSubMenu!: Locator;

  //reports request page
  readonly viewReportButton = this.page.locator(
    "input#ReportViewerControl_ctl04_ctl00",
  );
  readonly dateFromCalenderSelect = this.page.getByRole("button", {
    name: "Date From:",
  });
  readonly dateFromPicker = this.page.locator(
    'iframe[name="ReportViewerControl_ctl04_ctl03_ctl02"]',
  );
  readonly dateToPicker = this.page.locator(
    'iframe[name="ReportViewerControl_ctl04_ctl03_ctl02"]',
  );
  readonly dateToCalenderSelect = this.page.getByRole("button", {
    name: "Date To:",
  });
  readonly localityDropDown = this.page.locator(
    "#ReportViewerControl_ctl04_ctl07_ctl01",
  );

  readonly localityChevronButton = this.page.locator(
    "#ReportViewerControl_ctl04_ctl07_ctl01",
  );
  readonly locationDropDown = this.page.getByRole("button", {
    name: "Location (Room):",
  });
  readonly locationChevronButton = this.page.locator(
    "#ReportViewerControl_ctl04_ctl09_ctl01",
  );
  readonly judicialOfficerHolderDropDown = this.page.getByRole("button", {
    name: "Judicial Officer Holder:",
  });
  readonly judicialOfficerHolderDropDownSelectAll = this.page.locator(
    'input#ReportViewerControl_ctl04_ctl11_divDropDown_ctl00[type="checkbox"]',
  );
  readonly judicialOfficerHolderChevronButton = this.page.locator(
    "#ReportViewerControl_ctl04_ctl11_ctl01",
  );
  readonly jurisdictionDropDown = this.page.getByRole("button", {
    name: "Jurisdiction:",
  });
  readonly jurisdictionChevronButton = this.page.locator(
    "#ReportViewerControl_ctl04_ctl13_ctl01",
  );
  readonly serviceDropDown = this.page.getByRole("button", {
    name: "Service:",
  });
  readonly serviceChevronButton = this.page.locator(
    "#ReportViewerControl_ctl04_ctl17_ctl01",
  );

  //report
  readonly reportBody = this.page.locator(
    "div#VisibleReportContentReportViewerControl_ctl09",
  );

  //save user
  readonly saveUserButton = this.page.locator(
    "button#saveUser.btn.mcms-btn-solid",
  );

  //resource manageement
  readonly resourceManagementHeader = this.page.locator(
    "div.card-header h1.header-title",
  );

  //invalid mailbox report
  readonly invalidMailboxMenuOption = this.page.getByRole("link", {
    name: "Opens Invalid Mailboxes (SSRS)",
  });
  readonly invalidMailboxCheckbox = this.page.getByRole("checkbox", {
    name: "Invalid Mailbox Invalid",
  });

  //data export report

  constructor(page: Page) {
    super(page);
  }

  async reportRequestPageActions(
    todayDate: string,
    locality: string,
    location: string,
    jurisdiction: string,
    reportDate: string,
    service?: string,
    isWelsh: boolean = false,
  ): Promise<ViewReportsPage> {
    if (isWelsh) {
      this.reportSubMenu = this.page.getByRole("link", {
        name: this.CONSTANTS.REPORT_SUBMENU_WELSH_EXTERNAL_HEARING_LIST,
      });
    } else if (service) {
      this.reportSubMenu = this.page.getByRole("link", {
        name: this.CONSTANTS.REPORT_SUBMENU_INTERNAL_HEARING_LIST,
      });
    } else {
      this.reportSubMenu = this.page.getByRole("link", {
        name: this.CONSTANTS.REPORT_SUBMENU_EXTERNAL_HEARING_LIST,
      });
    }

    await expect(this.reportsMenu).toBeVisible();
    await this.reportsMenu.click();
    await expect(this.reportSubMenu).toBeVisible();
    const [popup] = await Promise.all([
      this.page.waitForEvent("popup"),
      this.reportSubMenu.click(),
    ]);

    const reportsRequestPage = new ViewReportsPage(popup);
    await expect(reportsRequestPage.viewReportButton).toBeVisible();

    //input to and from dates
    await reportsRequestPage.dateFromCalenderSelect.click();
    await reportsRequestPage.page
      .locator('iframe[name="ReportViewerControl_ctl04_ctl03_ctl02"]')
      .contentFrame()
      .locator(`td.ms-picker-today:has(a[id="${todayDate}"])`)
      .click();

    await reportsRequestPage.dateToCalenderSelect.click();
    await reportsRequestPage.page
      .locator('iframe[name="ReportViewerControl_ctl04_ctl05_ctl02"]')
      .contentFrame()
      .locator(`td.ms-picker-today:has(a[id="${todayDate}"])`)
      .click();

    //locality drop down select
    const localityDropDownSelect = reportsRequestPage.page.getByRole(
      "checkbox",
      { name: locality },
    );

    await reportsRequestPage.localityDropDown.click();
    await expect
      .poll(
        async () => {
          await reportsRequestPage.localityDropDown.click();
          return await localityDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await localityDropDownSelect.check();
    await reportsRequestPage.localityChevronButton.click();

    //location drop down select
    const locationDropDownSelect = reportsRequestPage.page.getByRole(
      "checkbox",
      { name: location },
    );
    await reportsRequestPage.locationChevronButton.isEnabled();
    await expect
      .poll(
        async () => {
          await reportsRequestPage.locationChevronButton.click();
          return await locationDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await locationDropDownSelect.check();
    await reportsRequestPage.locationChevronButton.click();

    //judicial officer holder drop down select
    await expect
      .poll(
        async () => {
          await reportsRequestPage.judicialOfficerHolderChevronButton.isVisible();
          await reportsRequestPage.judicialOfficerHolderChevronButton.click();
          return await reportsRequestPage.judicialOfficerHolderDropDownSelectAll
            .isVisible;
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await expect
      .poll(
        async () => {
          await reportsRequestPage.judicialOfficerHolderDropDownSelectAll.check();
          return await reportsRequestPage.judicialOfficerHolderDropDownSelectAll
            .isChecked;
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    //jurisdiction drop down select
    const jurisdictionDropDownSelect = reportsRequestPage.page.getByRole(
      "checkbox",
      {
        name: `${jurisdiction}`,
        exact: true,
      },
    );

    await expect
      .poll(
        async () => {
          await reportsRequestPage.jurisdictionChevronButton.isVisible();
          await reportsRequestPage.jurisdictionChevronButton.click();
          return await jurisdictionDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await expect
      .poll(
        async () => {
          await jurisdictionDropDownSelect.check();
          return await jurisdictionDropDownSelect.isChecked;
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await reportsRequestPage.jurisdictionChevronButton.click();

    //service block only execute when service has value
    if (service) {
      const serviceDropDownSelect = reportsRequestPage.page.getByRole(
        "checkbox",
        { name: `${service}`, exact: true },
      );

      await expect
        .poll(
          async () => {
            await reportsRequestPage.serviceChevronButton.isVisible();
            await reportsRequestPage.serviceChevronButton.click();
            return await serviceDropDownSelect.isVisible();
          },
          {
            intervals: [2_000],
            timeout: 60_000,
          },
        )
        .toBeTruthy();

      await expect
        .poll(
          async () => {
            await serviceDropDownSelect.check();
            return await serviceDropDownSelect.isChecked;
          },
          {
            intervals: [2_000],
            timeout: 60_000,
          },
        )
        .toBeTruthy();
      await reportsRequestPage.serviceChevronButton.click();
    }

    await expect(reportsRequestPage.viewReportButton).toBeEnabled();
    await reportsRequestPage.viewReportButton.click();

    //assert that report body is generated
    await expect
      .poll(
        async () => {
          return reportsRequestPage.reportBody.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 160_000,
        },
      )
      .toBeTruthy();

    // Common headings assertions for all the 3 reports
    await expect(reportsRequestPage.reportBody).toContainText(
      reportsRequestPage.CONSTANTS.SESSION_JOH,
    );
    await expect(reportsRequestPage.reportBody).toContainText(
      reportsRequestPage.CONSTANTS
        .LOCALITY_PONTYPRIDD_COUNTY_COURT_AND_FAMILY_COURT,
    );
    await expect(reportsRequestPage.reportBody).toContainText(reportDate);

    // Welsh report assertions
    if (isWelsh) {
      await expect(reportsRequestPage.reportBody).toContainText(
        reportsRequestPage.CONSTANTS.REPORT_HEADING_WELSH_DAILY_CAUSE_LIST,
      );
      await expect(reportsRequestPage.reportBody).toContainText(
        reportsRequestPage.CONSTANTS.CASE_LISTING_ADDRESS_PONTYPRIDD_BILINGUAL,
      );
      await expect(reportsRequestPage.reportBody).toContainText(
        reportsRequestPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_WELSH,
      );
      await expect(reportsRequestPage.reportBody).toContainText(reportDate);
    }

    // English report assertions
    else {
      await expect(reportsRequestPage.reportBody).toContainText(
        reportsRequestPage.CONSTANTS.LIST_TYPE_DAILY_CAUSE_LIST,
      );
      await expect(reportsRequestPage.reportBody).toContainText(
        reportsRequestPage.CONSTANTS.CASE_LISTING_ADDRESS_PONTYPRIDD,
      );
      await expect(reportsRequestPage.reportBody).toContainText(
        reportsRequestPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      );

      //TODO: uncomment this assertions when the bug(postcode missing in internal hearing list) is fixed.
      //await expect(reportsRequestPage.reportBody).toContainText('The Courthouse, Courthouse Street, Pontypridd, CF37 1JR');
    }
    return reportsRequestPage;
  }

  async assertDailyCauseListsByText(
    expectedArray: { header: string; value: string }[],
  ) {
    for (const { header, value } of expectedArray) {
      // Check the header text appears somewhere in the report body
      await expect(
        this.reportBody,
        `Expected header "${header}" to appear in report body`,
      ).toContainText(header, { ignoreCase: true });

      // Check the value text appears somewhere in the report body
      await expect(
        this.reportBody,
        `Expected value "${value}" for header "${header}" to appear in report body`,
      ).toContainText(value, { ignoreCase: true });
    }
  }

  buildEnglishDailyCauseListArray(
    startTime: string,
    duration: string,
    caseDetail: string,
    hearingType: string,
    hearingChannel: string,
    partyName: string,
  ) {
    return [
      { header: "Start Time", value: startTime },
      { header: "Duration", value: duration },
      { header: "Case Details", value: caseDetail },
      { header: "Hearing Type", value: hearingType },
      { header: "Hearing Channel", value: hearingChannel },
      { header: "Party Name", value: partyName },
    ];
  }

  buildWelshDailyCauseListArray(
    startTime: string,
    duration: string,
    caseDetail: string,
    hearingType: string,
    hearingChannel: string,
    partyName: string,
  ) {
    return [
      { header: "Amser Cychwyn, Start Time", value: startTime },
      { header: "Hyd, Duration", value: duration },
      { header: "Manylion yr Achos, Case Detail", value: caseDetail },
      { header: "Math o Wrandawiad, Hearing Type", value: hearingType },
      { header: "Sianel Clyw, Hearing Channel", value: hearingChannel },
      { header: "Enw’r Blaid, Party Name", value: partyName },
    ];
  }

  //looks for invalid mailbox checkbox and sets/unsets it based on boolean value passed
  async setInvalidMailboxCheckbox(checked: boolean, user: string) {
    await expect
      .poll(async () => await this.invalidMailboxCheckbox.isVisible(), {
        timeout: 10000,
        intervals: [500],
      })
      .toBe(true);

    if (checked) {
      await this.invalidMailboxCheckbox.check();
      await expect(this.invalidMailboxCheckbox).toBeChecked();
    } else {
      await this.invalidMailboxCheckbox.uncheck();
      await expect(this.invalidMailboxCheckbox).not.toBeChecked();
    }

    await this.saveUserButton.click();

    await expect
      .poll(async () => await this.resourceManagementHeader.isVisible(), {
        timeout: 10000,
        intervals: [500],
      })
      .toBe(true);
    await expect(this.resourceManagementHeader).toHaveText(
      `Resource Management - ${user}`,
    );
  }

  //opens invalid mailbox report form, selects all and generates report,
  //then checks for user details in report based on shouldFindRecord boolean

  //checks both when record is expected and when it is not
  async openInvalidMailboxReportFormAndGenerateReport(
    shouldFindRecord: boolean,
    mailboxUserGivenName: string,
    mailboxUserLastName: string,
    mailboxUserEmail: string,
  ) {
    await expect
      .poll(
        async () => {
          await this.reportsMenu.click();
          return await this.invalidMailboxMenuOption;
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    // Wait for the new tab when clicking the link
    const [newTab] = await Promise.all([
      this.page.waitForEvent("popup"),
      this.invalidMailboxMenuOption.click(),
    ]);

    // Now you can interact with the new tab as a Page object
    const mailboxLabel = newTab.locator(
      'label[for="ReportViewerControl_ctl04_ctl07_ddValue"]',
    );
    await expect
      .poll(async () => await mailboxLabel.isVisible(), {
        intervals: [500],
        timeout: 10_000,
      })
      .toBeTruthy();

    await newTab.getByRole("button", { name: "User:" }).click();

    const selectAllCheckbox = newTab.locator(
      'input#ReportViewerControl_ctl04_ctl03_divDropDown_ctl00[type="checkbox"][name="ReportViewerControl$ctl04$ctl03$divDropDown$ctl00"]',
    );
    await expect
      .poll(async () => await selectAllCheckbox.isVisible(), {
        intervals: [500],
        timeout: 10_000,
      })
      .toBeTruthy();
    await selectAllCheckbox.check();
    await expect(selectAllCheckbox).toBeChecked();

    const viewReportButton = newTab.locator(
      'input#ReportViewerControl_ctl04_ctl00[type="submit"][value="View Report"].SubmitButton',
    );
    await viewReportButton.click();

    const invalidMailboxesText = newTab.getByText("Invalid Mailboxes", {
      exact: true,
    });
    await expect
      .poll(async () => await invalidMailboxesText.isVisible(), {
        intervals: [500],
        timeout: 90_000,
      })
      .toBeTruthy();

    // Locate the report container
    const reportContainer = newTab.locator(
      "#VisibleReportContentReportViewerControl_ctl09",
    );

    // Wait for the report container
    await expect(reportContainer).toBeVisible({ timeout: 20000 });

    // Get all tables in the report
    const allTables = await reportContainer.locator("table").all();

    // Loop through all tables in the report container
    let found = false;
    for (const tbl of allTables) {
      // Get all rows in the current table
      const rows = await tbl.locator("tr").all();
      for (const row of rows) {
        // Get all cells in the current row
        const cells = await row.locator("td").all();
        // Check if the row has at least 4 cells and if the 2nd, 3rd, and 4th cells match the expected user details
        if (
          cells.length >= 4 &&
          (await cells[1].innerText()).trim() === mailboxUserLastName &&
          (await cells[2].innerText()).trim() === mailboxUserGivenName &&
          (await cells[3].innerText()).trim() === mailboxUserEmail
        ) {
          found = true; // Mark as found if all details match
          break;
        }
      }
      if (found) break;
    }
    expect(found).toBe(shouldFindRecord);
  }

  async generateDataExportReport(
    date: string,
    locality: string,
    location: string,
  ) {
    await expect(this.reportsMenu).toBeVisible();
    await this.reportsMenu.click();
    await expect(this.sidebarComponent.dataExportsSubMenu).toBeVisible();
    const [popup] = await Promise.all([
      this.page.waitForEvent("popup"),
      this.sidebarComponent.dataExportsSubMenu.click(),
    ]);

    const reportsRequestPage = new ViewReportsPage(popup);
    await expect(reportsRequestPage.viewReportButton).toBeVisible();

    //input to and from dates
    await reportsRequestPage.dateFromCalenderSelect.click();
    await reportsRequestPage.page
      .locator('iframe[name="ReportViewerControl_ctl04_ctl03_ctl02"]')
      .contentFrame()
      .locator(`td.ms-picker-today:has(a[id="${date}"])`)
      .click();

    await reportsRequestPage.dateToCalenderSelect.click();
    await reportsRequestPage.page
      .locator('iframe[name="ReportViewerControl_ctl04_ctl05_ctl02"]')
      .contentFrame()
      .locator(`td.ms-picker-today:has(a[id="${date}"])`)
      .click();

    //locality drop down select
    const localityDropDownSelect = reportsRequestPage.page.getByRole(
      "checkbox",
      { name: locality },
    );

    await reportsRequestPage.localityDropDown.click();
    await expect
      .poll(
        async () => {
          await reportsRequestPage.localityDropDown.click();
          return await localityDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await localityDropDownSelect.check();
    await reportsRequestPage.localityChevronButton.click();

    //location drop down select
    const locationDropDownSelect = reportsRequestPage.page.getByRole(
      "checkbox",
      { name: location },
    );
    await reportsRequestPage.locationChevronButton.isEnabled();
    await expect
      .poll(
        async () => {
          await reportsRequestPage.locationChevronButton.click();
          return await locationDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await locationDropDownSelect.check();
    await reportsRequestPage.locationChevronButton.click();

    //judicial officer holder drop down select
    await expect
      .poll(
        async () => {
          await reportsRequestPage.judicialOfficerHolderChevronButton.isVisible();
          await reportsRequestPage.judicialOfficerHolderChevronButton.click();
          return await reportsRequestPage.judicialOfficerHolderDropDownSelectAll
            .isVisible;
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await reportsRequestPage.judicialOfficerHolderDropDownSelectAll.click();

    await reportsRequestPage.viewReportButton.click();

    await expect
      .poll(
        async () =>
          await reportsRequestPage.page
            .locator("#VisibleReportContentReportViewerControl_ctl09")
            .innerText(),
        {
          timeout: 150_000,
          intervals: [10_000],
        },
      )
      .toContain("Data Export Report");

    // Wait for the report to be visible
    const reportContainer = reportsRequestPage.page.locator(
      "#VisibleReportContentReportViewerControl_ctl09",
    );
    await expect(reportContainer).toBeVisible({ timeout: 20000 });

    // Get all tables in the report
    const allTables = await reportContainer.locator("table").all();

    const expectedHeadings = [
      "JOH",
      "Court",
      "Room",
      "Date",
      "Start",
      "End",
      "Subject",
      "Description",
      "Location Comments",
      "Case ID",
      "Hearing ID",
      "Hearing Type",
      "Case Comments",
      "Listing Comments",
      "Session Type",
      "Jurisdiction",
      "Case Service",
      "Case Type",
    ];

    // Initialize an empty array to hold the extracted report data
    let extracted: { column: string; value: string }[] = [];

    // Loop through all tables found in the report container
    for (const tbl of allTables) {
      // Get all rows in the current table
      const rows = await tbl.locator("tr").all();
      // Skip tables that don't have at least 3 rows (header, headings, values)
      if (rows.length < 3) continue;

      // Extract the header cells from the second row (these should be the column headings)
      const headerCells = await rows[1].locator("td").all();
      const headers: string[] = [];
      for (const cell of headerCells) {
        // Add each header cell's text to the headers array
        headers.push((await cell.innerText()).trim());
      }

      // Check if the extracted headers match the expected headings for the Data Export Report
      if (headers.join(",") === expectedHeadings.join(",")) {
        // Extract the value cells from the third row (these should be the data values)
        const valueCells = await rows[2].locator("td").all();
        const values: string[] = [];
        for (const cell of valueCells) {
          // Add each value cell's text to the values array
          values.push((await cell.innerText()).trim());
        }

        // Map the headers and values into an array of objects with { column, value }
        extracted = headers.map((column, i) => ({
          column,
          value: values[i],
        }));

        // Stop searching after finding the correct table
        break;
      }
    }

    if (extracted.length === 0) {
      throw new Error(
        "Could not find the Data Export Report table with expected headings.",
      );
    }

    return extracted;
  }
}
