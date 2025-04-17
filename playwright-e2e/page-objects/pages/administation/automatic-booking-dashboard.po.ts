import { expect, Page } from '@playwright/test';
import { Base } from '../../base';

export class AutomaticBookingDashboardPage extends Base {
  readonly autoCreationTasksHeader = this.page.getByRole('heading', { name: 'Auto Creation Tasks' });
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
    .getByRole('group', { name: 'Region filter list with 0' })
    .getByLabel('Open listbox');
  readonly regionFilterOption = this.page.locator('.multiselect__options-checkmark').first();
  readonly regionFilterCloseButton = this.page.getByRole('button', { name: 'Close listbox' });

  readonly selectMidlandsRegion = this.page.getByRole('option', { name: 'Midlands' }).locator('span').nth(2);

  //cluster
  readonly clusterFilterListbox = this.page.getByLabel('Cluster filter list with 0').getByText('Select an item');
  readonly clusterFilterOption = this.page.locator(
    '#publishExternalLists_Creation_Cluster_listbox > div > .multiselect__options-container > .multiselect__options-checkmark',
  );
  readonly clusterFilterCloseButton = this.page.getByRole('button', { name: 'Close listbox' });

  readonly selectLeicestershireRutlandCluster = this.page
    .getByRole('option', { name: 'Leicestershire, Rutland,' })
    .locator('span')
    .nth(2);

  //localities
  readonly localitiesFilterListbox = this.page.getByLabel('Localities filter list with 0').getByText('Select an item');
  readonly localitiesFilterOption = this.page.locator(
    '#publishExternalLists_Creation_Localities_listbox > div > .multiselect__options-container > .multiselect__options-checkmark',
  );
  readonly localitiesFilterCloseButton = this.page.getByRole('button', { name: 'Close listbox' });

  readonly selectLeicesterCombinedCourt = this.page.locator(
    'span.multiselect__options-item[for="publishExternalLists_Creation_Localities_locationsByRegistry_62000"]',
  );

  //jurisdictions
  readonly jurisdictionsFilterListbox = this.page
    .getByRole('group', { name: 'Jurisdictions filter list' })
    .getByLabel('Open listbox');
  readonly jurisdictionsFilterOption = this.page.locator(
    '#publishExternalLists_Creation_Jurisdiction_listbox > div > .multiselect__options-container > .multiselect__options-checkmark',
  );
  readonly jurisdictionsFilterCloseButton = this.page.getByRole('button', { name: 'Close listbox' });

  readonly jurisdictionFamily = this.page.locator('#publishExternalLists_Creation_Jurisdiction_option_3');

  //service
  readonly serviceFilterListbox = this.page
    .getByRole('group', { name: 'Service filter list with 0' })
    .getByLabel('Open listbox');
  readonly serviceFilterOption = this.page.locator(
    '#publishExternalLists_Creation_Service_listbox > div > .multiselect__options-container > .multiselect__options-checkmark',
  );
  readonly serviceFilterCloseButton = this.page.getByRole('button', { name: 'Close listbox' });

  readonly includeUnallocatedSessionsCheckbox = this.page.locator('#publishExternalLists_Creation_Un-Allocated');

  constructor(page: Page) {
    super(page);
  }

  async populateCreatePublishExternalListsForm() {
    await this.selectMidlandsInRegionFilter();
    await this.selectLeicesterRutlandClusterFilter();
    await this.selectLeicesterCCInLocalitiesFilter();
    await this.selectFamilyJurisdiction();
    // await this.selectAllInServiceFilter();

    // await expect(this.includeUnallocatedSessionsCheckbox).toBeVisible();
    // await this.includeUnallocatedSessionsCheckbox.click();
  }

  async selectMidlandsInRegionFilter() {
    await expect(this.regionFilterListbox).toBeVisible();
    await this.regionFilterListbox.click();
    await this.selectMidlandsRegion.click();
  }

  async selectLeicesterRutlandClusterFilter() {
    await expect(this.clusterFilterListbox).toBeVisible();
    await this.clusterFilterListbox.click();

    await expect
      .poll(
        async () => {
          return await this.selectLeicestershireRutlandCluster.isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.selectLeicestershireRutlandCluster.click();
  }

  async selectLeicesterCCInLocalitiesFilter() {
    await expect(this.localitiesFilterListbox).toBeVisible();
    await this.localitiesFilterListbox.click();

    await expect
      .poll(
        async () => {
          return await this.selectLeicesterCombinedCourt.isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.selectLeicesterCombinedCourt.click();
  }

  async selectFamilyJurisdiction() {
    await expect(this.jurisdictionsFilterListbox).toBeVisible();
    await this.jurisdictionsFilterListbox.click();
    await expect
      .poll(
        async () => {
          return await this.jurisdictionFamily.isVisible();
        },
        {
          intervals: [500],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.jurisdictionFamily.click();
  }

  async selectAllInServiceFilter() {
    await expect(this.serviceFilterListbox).toBeVisible();
    await this.serviceFilterListbox.click();
    await this.serviceFilterOption.click();
  }
}
