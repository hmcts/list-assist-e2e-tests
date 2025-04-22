import { expect, Page } from '@playwright/test';
import { Base } from '../../base';
import { ViewReportsPage } from '../reports/view-reports.po';
import { version } from 'os';

export class AutomaticBookingDashboardPage extends Base {
  readonly CONSTANTS = {
    AUTO_CREATION_TASK_HEADER_TEXT: 'Auto Creation Tasks',
    REGION_MIDLANDS: 'Midlands',
    CLUSTER_LEICESTERSHIRE_RUTLAND: 'Leicestershire, Rutland, Lincolnshire and North',
    FAMILY_JURISDICTION: 'Family',
    REGION_FILTER_LIST_BUTTON: 'Region filter list with 0',
    CLUSTER_FILTER_LIST_BUTTON: 'Cluster filter list with 0',
    JURISDICTION_FILTER_LIST_BUTTON: 'Jurisdictions filter list',
    LOCALITIES_FILTER_LIST_BUTTON: 'Localities filter list with 0',
    SERVICE_FILTER_LIST_BUTTON: 'Service filter list with 0',
    SELECT_AN_ITEM_BUTTON_TEXT: 'Select an item',
    CLOSE_LISTBOX_NAME: 'Close listbox',
    DAILY_MIXED_CAUSE_LIST_SSRS: 'Daily Mixed Cause List Publish (SSRS)',
    LIST_OF_VERSION_TYPES_LABEL: 'List of Version Types',
    VERSION_TYPE: 'FINAL',
    CIVIL_AND_FAMILY_DAILY_CAUSE_LIST: 'CIVIL AND FAMILY DAILY CAUSE LIST',
    LOCATION_LEICESTER_COUNTY_COURTROOM_07: 'Leicester County Courtroom 07',
    LOCALITY_LEICESTER_COMBINED_COURT: 'Leicester Combined Court',
    JURISDICTION_FAMILY: 'Family',
    SERVICE_LABEL: 'Service',
    SERVICE_DIVORCE: 'Divorce',
  };
  readonly autoCreationTasksHeader = this.page.getByRole('heading', {
    name: this.CONSTANTS.AUTO_CREATION_TASK_HEADER_TEXT,
  });
  readonly autoCreationTasksTable = this.page.locator('.table-responsive');

  //publish external lists
  readonly publishExternalListsOption = this.page.getByRole('cell', { name: 'Publish External Lists', exact: true });
  readonly publishExternalListsCreate = this.page.getByRole('button', { name: 'Create Publish External Lists' });
  readonly publishExternalListsView = this.page.getByRole('button', { name: 'View Publish External Lists' });

  //create publish external lists page
  readonly createPublishExternalListsHeader = this.page.getByRole('heading', {
    name: 'Create Publish External Lists',
  });

  //region
  readonly regionFilterListbox = this.page
    .getByRole('group', { name: this.CONSTANTS.REGION_FILTER_LIST_BUTTON })
    .getByLabel('Open listbox');
  readonly regionFilterOption = this.page.locator('.multiselect__options-checkmark').first();

  //cluster
  readonly clusterFilterListbox = this.page
    .getByLabel(this.CONSTANTS.CLUSTER_FILTER_LIST_BUTTON)
    .getByText(this.CONSTANTS.SELECT_AN_ITEM_BUTTON_TEXT);
  readonly clusterFilterOption = this.page.locator(
    '#publishExternalLists_Creation_Cluster_listbox > div > .multiselect__options-container > .multiselect__options-checkmark',
  );

  //localities
  readonly localitiesFilterListbox = this.page
    .getByLabel(this.CONSTANTS.LOCALITIES_FILTER_LIST_BUTTON)
    .getByText('Select an item');
  readonly localitiesFilterOption = this.page.locator(
    '#publishExternalLists_Creation_Localities_listbox > div > .multiselect__options-container > .multiselect__options-checkmark',
  );

  //jurisdictions
  readonly jurisdictionsFilterListbox = this.page
    .getByRole('group', { name: this.CONSTANTS.JURISDICTION_FILTER_LIST_BUTTON })
    .getByLabel('Open listbox');

  readonly jurisdictionsFilterOption = this.page.getByText(this.CONSTANTS.JURISDICTION_FAMILY);

  //service
  readonly serviceFilterListbox = this.page.getByLabel(this.CONSTANTS.SERVICE_LABEL);
  readonly serviceFilterOptionDivorce = this.page.locator(
    'div.multiselect__options-container span[for="publishExternalLists_Creation_Service_getMtrCategoryByJurisdiction_4"]',
  );

  //list name
  readonly listNameDropDown = this.page
    .getByRole('combobox')
    .filter({ hasText: 'Please choose Daily Family' })
    .locator('div')
    .first();

  //version type
  readonly versionTypeDropDown = this.page.locator('#publishExternalLists_Creation_versionType');

  //preview button
  readonly previewButton = this.page.locator('#publishExternalLists_Creation_Preview');

  //report preview
  readonly includeUnallocatedSessionsCheckbox = this.page.getByRole('checkbox', {
    name: 'Include Un-Allocated Sessions',
  });

  readonly closeListboxButton = this.page.getByRole('button', { name: this.CONSTANTS.CLOSE_LISTBOX_NAME });

  constructor(page: Page) {
    super(page);
  }

  async populateCreatePublishExternalListsForm(
    region: string,
    cluster: string,
    locality: string,
    jurisdiction: string,
    listType: string,
    versionType: string,
  ) {
    await this.selectRegionFilter(region);
    await this.selectClusterFilter(cluster);
    await this.selectLocalitiesFilter(locality);
    await this.selectJurisdiction(jurisdiction);
    await this.selectServiceFilter();
    await this.selectListName(listType);
    await this.selectVersionType(versionType);
    await this.includeUnallocatedSessionsCheckbox.click();

    await expect(this.previewButton).toBeVisible();
    await this.previewButton.click();
  }

  async selectRegionFilter(region: string) {
    await expect(this.regionFilterListbox).toBeVisible();
    await this.regionFilterListbox.click();
    await this.page.getByText(region).click();

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
    await this.page.getByText(jurisdiction).click();

    await this.closeListboxButton.click();
  }

  async selectServiceFilter() {
    await this.page
      .getByLabel(this.CONSTANTS.SERVICE_FILTER_LIST_BUTTON)
      .getByText(this.CONSTANTS.SELECT_AN_ITEM_BUTTON_TEXT)
      .click();

    await expect
      .poll(
        async () => {
          return await this.serviceFilterOptionDivorce.isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.serviceFilterOptionDivorce.click();

    await this.closeListboxButton.click();
  }

  async selectListName(listType: string) {
    await this.listNameDropDown.click();
    await this.page.getByText(listType).click();
  }

  async selectVersionType(versionType: string) {
    await this.page.getByLabel(this.CONSTANTS.LIST_OF_VERSION_TYPES_LABEL).selectOption(versionType);
  }

  async assertPreviewReport(formattedDate: string, listType: string, location: string) {
    const reportPopup = await this.page.waitForEvent('popup');
    await this.previewButton.click();
    const report = await reportPopup;
    await expect(report.getByText(listType)).toBeVisible();
    await expect(report.getByText(formattedDate)).toBeVisible();
    await expect(report.getByText(location)).toBeVisible();
  }
}
