import { expect, Page } from "@playwright/test";
import { Base } from "../../base";
import { DataUtils } from "../../../utils/data.utils";
import { DateTime } from "luxon";

export class AutomaticBookingDashboardPage extends Base {
  readonly CONSTANTS = {
    AUTO_CREATION_TASK_HEADER_TEXT: "Auto Creation Tasks",
    AUTO_CREATION_REGION_MIDLANDS: "Midlands",
    AUTO_CREATION_CLUSTER_LEICESTERSHIRE_RUTLAND:
      "Leicestershire, Rutland, Lincolnshire and North",
    AUTO_CREATION_JURISDICTION_CIVIL: "Civil",
    AUTO_CREATION_SERVICE_DAMAGES: "Damages",
    AUTO_CREATION_REGION_WALES: "Wales",
    AUTO_CREATION_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS:
      "Wales Civil, Family and Tribunals",
    AUTO_CREATION_LOCATION_LEICESTER_CC_7: "Leicester County Courtroom 07",
    AUTO_CREATION_LOCATION_PONTYPRIDD_CRTRM_1: "Pontypridd Courtroom 01",
    AUTO_CREATION_LOCALITY_PONTYPRIDD_COUNTY_COURT:
      "Pontypridd County Court and",
    AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC:
      "Newport (South Wales) County Court and Family Court",
    AUTO_CREATION_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1:
      "Newport (South Wales) Chambers 01",
    REGION_FILTER_LIST_BUTTON: "Region filter list with 0",
    CLUSTER_FILTER_LIST_BUTTON: "Cluster filter list with 0",
    JURISDICTION_FILTER_LIST_BUTTON: "Jurisdictions filter list",
    LOCALITIES_FILTER_LIST_BUTTON: "Localities filter list with 0",
    SERVICE_FILTER_LIST_BUTTON: "Service filter list with 0",
    SELECT_AN_ITEM_BUTTON_TEXT: "Select an item",
    CLOSE_LISTBOX_NAME: "Close listbox",
    AUTO_CREATION_DAILY_MIXED_CAUSE_LIST_SSRS:
      "Daily Mixed Cause List Publish (SSRS)",
    LIST_OF_VERSION_TYPES_LABEL: "List of Version Types",
    AUTO_CREATION_VERSION_TYPE: "FINAL",
    CIVIL_AND_FAMILY_DAILY_CAUSE_LIST: "CIVIL AND FAMILY DAILY CAUSE LIST",
    LOCATION_LEICESTER_COUNTY_COURTROOM_07: "Leicester County Courtroom 07",
    LOCALITY_LEICESTER_COMBINED_COURT: "Leicester Combined Court",
    JURISDICTION_FAMILY: "Family",
    SERVICE_LABEL: "Service",
    AUTO_CREATION_SERVICE_DIVORCE_OPTION: "4",
    SCHEDULE_JOBS_AUTOMATIC_BOOKING_QUEUE_JOB: "AutomaticBookingQueueJob",
  };
  readonly autoCreationTasksHeader = this.page.getByRole("heading", {
    name: this.CONSTANTS.AUTO_CREATION_TASK_HEADER_TEXT,
  });
  readonly autoCreationTasksTable = this.page.locator(".table-responsive");

  //publish external lists
  readonly publishExternalListsOption = this.page.getByRole("cell", {
    name: "Publish External Lists",
    exact: true,
  });
  readonly publishExternalListsCreate = this.page.getByRole("button", {
    name: "Create Publish External Lists",
  });
  readonly publishExternalListsView = this.page.getByRole("button", {
    name: "View Publish External Lists",
  });

  //create publish external lists page
  readonly createPublishExternalListsHeader = this.page.getByRole("heading", {
    name: "Create Publish External Lists",
  });

  //region
  readonly regionFilterListbox = this.page
    .getByRole("group", { name: this.CONSTANTS.REGION_FILTER_LIST_BUTTON })
    .getByLabel("Open listbox");
  readonly regionFilterOption = this.page
    .locator(".multiselect__options-checkmark")
    .first();

  //cluster
  readonly clusterFilterListbox = this.page
    .getByLabel(this.CONSTANTS.CLUSTER_FILTER_LIST_BUTTON)
    .getByText(this.CONSTANTS.SELECT_AN_ITEM_BUTTON_TEXT);
  readonly clusterFilterOption = this.page.locator(
    "#publishExternalLists_Creation_Cluster_listbox > div > .multiselect__options-container > .multiselect__options-checkmark",
  );

  //localities
  readonly localitiesFilterListbox = this.page
    .getByLabel(this.CONSTANTS.LOCALITIES_FILTER_LIST_BUTTON)
    .getByText("Select an item");
  readonly localitiesFilterOption = this.page.locator(
    "#publishExternalLists_Creation_Localities_listbox > div > .multiselect__options-container > .multiselect__options-checkmark",
  );

  //jurisdictions
  readonly jurisdictionsFilterListbox = this.page
    .getByRole("group", {
      name: this.CONSTANTS.JURISDICTION_FILTER_LIST_BUTTON,
    })
    .getByLabel("Open listbox");

  readonly jurisdictionsFilterOption = this.page.getByText(
    this.CONSTANTS.JURISDICTION_FAMILY,
  );

  //service
  readonly serviceFilterListbox = this.page.getByLabel(
    this.CONSTANTS.SERVICE_LABEL,
  );

  //list name
  readonly listNameDropDown = this.page.locator(
    'div.multiselect[aria-owns="publishExternalLists_Creation_List_listbox"]',
  );

  //version type
  readonly versionTypeDropDown = this.page.locator(
    "#publishExternalLists_Creation_versionType",
  );

  //preview button
  readonly previewButton = this.page.locator(
    "#publishExternalLists_Creation_Preview",
  );

  //publish button
  readonly publishButton = this.page.locator(
    "#publishExternalLists_Creation_Publish",
  );

  //report preview
  readonly includeUnallocatedSessionsCheckbox = this.page.getByRole(
    "checkbox",
    {
      name: "Include Un-Allocated Sessions",
    },
  );

  readonly closeListboxButton = this.page.getByRole("button", {
    name: this.CONSTANTS.CLOSE_LISTBOX_NAME,
  });

  //duplicate report confirmation
  readonly duplicationReportOkButton = this.page.getByRole("button", {
    name: "OK",
    exact: true,
  });
  //previous publish external list runs
  readonly previousPublishExternalListRunsHeader = this.page.locator(
    "h2.header-title",
    {
      hasText: "Previous Publish External Lists Runs",
    },
  );
  readonly closePublishExternalListButton = this.page.locator(
    "#closePreviousPublishExternalListsRunPopup",
  );

  //publish external list view
  readonly previousPublishExternalListHeader = this.page.getByRole("heading", {
    name: "Previous Publish External",
  });
  readonly queuedStatus = this.page
    .locator("span.mcms-text-warning", { hasText: "Queued" })
    .first();
  readonly dateFilter = this.page
    .locator(".input-group-text > .glyphicon")
    .first();
  readonly publishExternalListRefreshButton = this.page.locator(
    "#publishExternalLists_PreviousRun_Refresh",
  );
  readonly publishExternalListClearFilterButton = this.page
    .getByRole("group", { name: "Localities filter list with" })
    .getByLabel("Clear all selected options");
  readonly publishExternalListLocalityFilter = this.page
    .getByRole("group", { name: "Localities filter list with 0" })
    .getByLabel("Open listbox");

  constructor(page: Page) {
    super(page);
  }

  async populateCreatePublishExternalListsForm(
    region: string,
    cluster: string,
    locality: string,
    jurisdiction: string,
    service: string,
    listType: string,
    versionType: string,
  ) {
    await this.selectRegionFilter(region);
    await this.selectClusterFilter(cluster);
    await this.selectLocalitiesFilter(locality);
    await this.selectJurisdiction(jurisdiction);
    await this.selectServiceFilter(service);
    await this.selectListName(listType);
    await this.selectVersionType(versionType);
    await this.includeUnallocatedSessionsCheckbox.click();

    await expect(this.previewButton).toBeVisible();
    await this.previewButton.click();
  }

  async selectRegionFilter(region: string) {
    await expect(this.regionFilterListbox).toBeVisible();
    await this.regionFilterListbox.click();
    await this.page.getByText(region).first().click();

    await this.closeListboxButton.click();
  }

  async selectClusterFilter(cluster: string) {
    await expect(this.clusterFilterListbox).toBeVisible();
    await this.clusterFilterListbox.click();

    await expect
      .poll(
        async () => {
          return await this.page.getByText(cluster).isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.page.getByText(cluster).click();
    await this.closeListboxButton.click();
  }

  async selectLocalitiesFilter(locality: string) {
    await expect(this.localitiesFilterListbox).toBeVisible();
    await this.localitiesFilterListbox.click();

    await expect
      .poll(
        async () => {
          return await this.page.getByText(locality).isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.page.getByText(locality).click();
    await this.closeListboxButton.click();
  }

  async selectJurisdiction(jurisdiction: string) {
    await expect(this.jurisdictionsFilterListbox).toBeVisible();
    await this.jurisdictionsFilterListbox.click();

    await expect
      .poll(
        async () => {
          return await this.page
            .getByText(jurisdiction, { exact: true })
            .isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.page.getByText(jurisdiction, { exact: true }).click();

    await this.closeListboxButton.click();
  }

  async selectServiceFilter(service: string) {
    const serviceFilterOption = this.page.locator(
      "#publishExternalLists_Creation_Service_listbox .multiselect__options-item",
      { hasText: `${service}` },
    );

    await this.page
      .getByLabel(this.CONSTANTS.SERVICE_FILTER_LIST_BUTTON)
      .getByText(this.CONSTANTS.SELECT_AN_ITEM_BUTTON_TEXT)
      .click();

    await expect
      .poll(
        async () => {
          return await serviceFilterOption.isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await serviceFilterOption.click();

    await this.closeListboxButton.click();
  }

  async selectListName(listType: string) {
    await this.listNameDropDown.click();
    await this.page
      .locator(
        "#publishExternalLists_Creation_List_listbox .multiselect__option span",
        { hasText: `${listType}` },
      )
      .click();
  }

  async selectVersionType(versionType: string) {
    await this.page
      .getByLabel(this.CONSTANTS.LIST_OF_VERSION_TYPES_LABEL)
      .selectOption(versionType);
  }

  async assertPreviewReport(
    formattedDate: string,
    listType: string,
    location: string,
  ) {
    const reportPopup = await this.page.waitForEvent("popup");
    await this.previewButton.click();
    const report = reportPopup;
    await expect(report.getByText(listType)).toBeVisible();
    await expect(report.getByText(formattedDate)).toBeVisible();
    await expect(report.getByText(location)).toBeVisible();
  }

  async waitForPublishExternalListRunsToBeVisible() {
    // Wait for duplicate report confirmation and handle it if present
    try {
      await expect
        .poll(
          async () => {
            return await this.page
              .getByRole("button", { name: "OK", exact: true })
              .click();
          },
          { intervals: [5000], timeout: 30_000 },
        )
        .toBeTruthy();
    } catch {
      // If the confirmation does not appear, continue
    }

    // Wait for "Publish External List Runs" header to be visible
    await expect
      .poll(
        async () => {
          return await this.previousPublishExternalListRunsHeader.isVisible();
        },
        {
          intervals: [2000],
          timeout: 90_000,
        },
      )
      .toBeTruthy();
  }

  async clickRunForAutomaticBookingQueueJob(queueJob: string) {
    // Find the row containing 'AutomaticBookingQueueJob'
    const jobRow = this.page.locator("tr", { hasText: queueJob });

    // Assert the row exists and contains the correct text
    await expect(jobRow.locator("td").first()).toHaveText(queueJob);

    // Find and click the 'Run' button in this row
    const runButton = jobRow.locator("a.link-class", { hasText: "Run" });
    await expect(runButton).toBeVisible();
    await runButton.click();
  }

  async assertPreviousPublishExternalListRunsTable(
    jobRun: string,
    locality: string,
    dateFrom: string,
    dateTo: string,
  ) {
    //filters table
    await this.publishExternalListClearFilterButton.click();

    await this.publishExternalListLocalityFilter.click();
    await this.page
      .getByRole("option", { name: locality })
      .locator("span")
      .nth(2)
      .click();

    //input dates
    await this.dateFilter.click();
    await this.page.locator(`div.vc-day.id-${dateFrom}`).first().click();
    await this.page.locator(`div.vc-day.id-${dateTo}`).first().click();

    await this.publishExternalListRefreshButton.click();

    // Locate the tbody containing the rows
    const tbody = this.page.locator("tbody.vuetable-body");
    // Get the first row within the tbody
    const firstRow = tbody.locator("tr");

    if (jobRun === "false") {
      // Assert that the first row contains 'Queued'
      await expect(firstRow.getByText("Queued")).toBeVisible();
      await expect(firstRow.getByText("Queued")).toHaveCount(1);
    } else if (jobRun === "true") {
      await expect(firstRow.getByText("Queued")).toHaveCount(0);
      await expect(firstRow.getByText("Queued")).toBeHidden();

      const dataUtils = new DataUtils();
      const runDate =
        dataUtils.getCurrentDateIfFormatDayNumericDateMonthNumericYear();
      const runTime = dataUtils.getCurrentTimeInFormatHHMM();

      const viewErrorVisible = await firstRow
        .getByText("View error")
        .first()
        .isVisible();

      if (viewErrorVisible) {
        const [runDateVisible, runTimeVisible] = await Promise.all([
          firstRow.getByText(runDate).isVisible(),
          firstRow.getByText(runTime).isVisible(),
        ]);

        const isWithin10Minutes = (): boolean => {
          const now = DateTime.local();
          const reported = DateTime.fromFormat(runTime, "HH:mm");
          const diff = now.diff(reported, "minutes").as("minutes");
          return Math.abs(diff) <= 10;
        };

        if (runDateVisible && runTimeVisible && isWithin10Minutes()) {
          console.warn(
            "Known bug: 'View error' present – failing test intentionally.",
          );
          throw new Error(
            "'View error' indicated failure with report generation",
          );
        }
      }
    }
  }
}
