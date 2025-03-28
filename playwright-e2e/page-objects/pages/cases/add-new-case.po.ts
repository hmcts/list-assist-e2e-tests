import { Page } from "@playwright/test";
import { Base } from "../../base";

export class AddNewCasePage extends Base {
  readonly hmctsCaseNumber = generateRandomAlphanumeric(10).toUpperCase();

  //new case page
  readonly newCaseHeader = this.page.locator('h1.header-title.my-2');
  readonly jurisdictionSelector = this.page.getByLabel('Matter Detail - Jurisdiction_listbox').getByText('Select One');
  readonly serviceSelector = this.page.getByLabel('Matter Detail - Service_listbox').getByText('Select One');
  readonly caseTypeSelector = this.page.getByLabel('Matter Detail - Case Type_listbox').locator('div').filter({ hasText: 'Select One' });
  readonly regionSelector = this.page.getByRole('combobox', { name: 'Matter Detail - Region_listbox' }).locator('div').first();
  readonly clusterSelect = this.page.getByRole('combobox', { name: 'Matter Detail - Cluster_listbox' }).locator('div').first();
  readonly owningHearingSelector = this.page.getByLabel('Matter Detail - Owning Hearing Location_listbox').getByText('Select One');
  readonly hmctsCaseNumberInput = this.page.locator("#mtrNumberAdded");
  readonly enterNameInput = this.page.locator("#mtrAltTitleTxt");
  readonly saveButton = this.page.getByRole('button', { name: 'Save Case', exact: true });

  constructor(page: Page) {
    super(page);
  }

  async selectJurisdiction(jurisdiction: string) {
    await this.jurisdictionSelector.click();
    await this.page.getByRole('option', { name: jurisdiction, exact: true }).locator('span').first().click();
  }

  async selectService(service : string) {
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
    owninghearing: string) {
    await this.selectJurisdiction(jurisdiction);
    await this.selectService(service);
    await this.selectCaseType(caseType);
    await this.selectRegion(region);
    await this.selectCluster(cluster);
    await this.selectOwningHearing(owninghearing);
    await this.hmctsCaseNumberInput.fill(hmctsCaseNumber);
    await this.enterNameInput.fill(caseName)
  }
}

function generateRandomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
