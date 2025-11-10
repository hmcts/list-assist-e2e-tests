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
    CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1: "Pontypridd Courtroom 01",
    CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT:
      "Pontypridd County Court and",
    CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1:
      "Newport (South Wales) Chambers 01",
    JURISDICTION_CIVIL: "Civil",
    SERVICE_DAMAGES: "Damages",
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
  readonly localityDropDown = this.page.getByRole("textbox", {
    name: "Locality:",
  });
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
  ) {
    if (service) {
      this.reportSubMenu = this.page.getByRole("link", {
        name: "Opens Internal Hearing List",
      });
    } else {
      this.reportSubMenu = this.page.getByRole("link", {
        name: "External Hearing List v2.0 (SSRS)",
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

    await expect(reportsRequestPage.reportBody).toContainText(locality);
    await expect(reportsRequestPage.reportBody).toContainText(
      "DAILY CAUSE LIST",
    );
    await expect(reportsRequestPage.reportBody).toContainText(reportDate);
  }

  //looks for invalid mailbox checkbox and sets/unsets it based on boolean value passed
  async setInvalidMailboxCheckbox(checked: boolean, user: string) {
    const isChecked = await this.invalidMailboxCheckbox.isChecked();

    if (isChecked === checked) {
      console.log(
        `Checkbox already ${checked ? "checked" : "unchecked"}, skipping action and Save User step.`,
      );
      return;
    }

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

    // Wait for the popup when clicking the link
    const [popup] = await Promise.all([
      this.page.waitForEvent("popup"),
      this.invalidMailboxMenuOption.click(),
    ]);

    // Now you can interact with the popup as a Page object
    const mailboxLabel = popup.locator(
      'label[for="ReportViewerControl_ctl04_ctl07_ddValue"]',
    );
    await expect
      .poll(async () => await mailboxLabel.isVisible(), {
        intervals: [500],
        timeout: 10_000,
      })
      .toBeTruthy();

    await popup.getByRole("button", { name: "User:" }).click();

    const selectAllCheckbox = popup.locator(
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

    const viewReportButton = popup.locator(
      'input#ReportViewerControl_ctl04_ctl00[type="submit"][value="View Report"].SubmitButton',
    );
    await viewReportButton.click();

    const invalidMailboxesText = popup.getByText("Invalid Mailboxes", {
      exact: true,
    });
    await expect
      .poll(async () => await invalidMailboxesText.isVisible(), {
        intervals: [500],
        timeout: 90_000,
      })
      .toBeTruthy();

    // Locate the report container
    const reportContainer = popup.locator(
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
}
