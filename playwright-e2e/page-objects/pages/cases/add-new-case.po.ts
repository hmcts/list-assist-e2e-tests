import { Page, expect } from '@playwright/test';
import { Base } from '../../base';

interface CaseData {
  jurisdiction: string;
  service: string;
  caseType: string;
  region: string;
  cluster: string;
  hearingCentre: string;
}

export class AddNewCasePage extends Base {
  readonly CONSTANTS = {
    HMCTS_CASE_NUMBER_HEADER_VALUE: 'HMCTS Case Number',
    CASE_NAME_HEADER_VALUE: 'Case Name',
    JURISDICTION_FAMILY: 'Family',
    SERVICE_DIVORCE: 'Divorce',
    DECREE_ABSOLUTE_CASE_TYPE: 'Decree Absolute',
    REGION_WALES: 'Wales',
    CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS: 'Wales Civil, Family and Tribunals',
    HEARING_CENTRE_CARDIFF: 'Cardiff Civil and Family Justice Centre',
    CURRENT_STATUS_AWAITING_LISTING: 'Awaiting Listing',
    HEARING_TYPE_APPLICATION_REF: '449628128',
  };

  //new case page
  readonly newCaseHeader = this.page.locator('h1.header-title.my-2');
  readonly jurisdictionSelector = this.page.getByLabel('Matter Detail - Jurisdiction_listbox').getByText('Select One');
  readonly serviceSelector = this.page.getByLabel('Matter Detail - Service_listbox').getByText('Select One');
  readonly caseTypeSelector = this.page
    .getByLabel('Matter Detail - Case Type_listbox')
    .locator('div')
    .filter({ hasText: 'Select One' });
  readonly regionSelector = this.page
    .getByRole('combobox', { name: 'Matter Detail - Region_listbox' })
    .locator('div')
    .first();
  readonly clusterSelect = this.page
    .getByRole('combobox', { name: 'Matter Detail - Cluster_listbox' })
    .locator('div')
    .first();
  readonly owningHearingSelector = this.page
    .getByLabel('Matter Detail - Owning Hearing Location_listbox')
    .getByText('Select One');
  readonly hmctsCaseNumberInput = this.page.locator('#mtrNumberAdded');
  readonly enterNameInput = this.page.locator('#mtrAltTitleTxt');
  readonly saveButton = this.page.getByRole('button', {
    name: 'Save Case',
    exact: true,
  });

  constructor(page: Page) {
    super(page);
  }

  async selectJurisdiction(jurisdiction: string) {
    await this.jurisdictionSelector.click();
    await this.page.getByRole('option', { name: jurisdiction, exact: true }).locator('span').first().click();
  }

  async selectService(service: string) {
    await this.serviceSelector.click();
    await this.page.getByRole('option', { name: service, exact: true }).locator('span').first().click();
  }

  async selectCaseType(caseType: string) {
    await this.caseTypeSelector.click();
    await this.page.getByText(caseType).click();
  }

  async selectRegion(region: string) {
    await this.regionSelector.click();
    await this.page.getByRole('option', { name: region }).locator('span').first().click();
  }

  async selectCluster(cluster: string) {
    await this.clusterSelect.click();
    await this.page.getByText(cluster).click();
  }

  async selectOwningHearing(owningHearing: string) {
    await this.owningHearingSelector.click();
    await this.page.getByText(owningHearing).click();
  }

  async populateNewCaseDetails(
    hmctsCaseNumber: string,
    caseName: string,
    jurisdiction: string,
    service: string,
    caseType: string,
    region: string,
    cluster: string,
    owninghearing: string,
  ) {
    await this.selectJurisdiction(jurisdiction);
    await this.selectService(service);
    await this.selectCaseType(caseType);
    await this.selectRegion(region);
    await this.selectCluster(cluster);
    await this.selectOwningHearing(owninghearing);
    await this.hmctsCaseNumberInput.fill(hmctsCaseNumber);
    await this.enterNameInput.fill(caseName);
  }

  async addNewCaseWithMandatoryData(caseData: CaseData, hmctsCaseNumber: string, caseName: string) {
    console.log(caseName);
    // Assert that the header contains the text 'New Case'
    await expect(this.newCaseHeader).toHaveText('New Case');
    // Assert that sidebar is visible
    await expect(this.sidebarComponent.sidebar).toBeVisible();
    // Populate new case details form
    await this.populateNewCaseDetails(
      hmctsCaseNumber,
      caseName,
      caseData.jurisdiction,
      caseData.service,
      caseData.caseType,
      caseData.region,
      caseData.cluster,
      caseData.hearingCentre,
    );
    // Click save button
    await this.saveButton.click();

    //confirms banner for created case is visible
    await expect
      .poll(
        async () => {
          return await this.newCaseHeader.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await expect(this.newCaseHeader).toBeVisible();
  }
}
