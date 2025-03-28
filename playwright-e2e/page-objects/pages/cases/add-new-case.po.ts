import { Page } from "@playwright/test";
import { Base } from "../../base";

export class AddNewCasePage extends Base {
  readonly hmctsCaseNumber = generateRandomAlphanumeric(10).toUpperCase();

  //new case page
  readonly newCaseHeader = this.page.locator('h1.header-title.my-2');
  readonly jurisdictionSelector = this.page.getByLabel('Matter Detail - Jurisdiction_listbox').getByText('Select One');
  readonly familySelect = this.page.getByRole('option', { name: 'Family', exact: true }).locator('span').first();
  readonly serviceSelector = this.page.getByLabel('Matter Detail - Service_listbox').getByText('Select One');
  readonly divorceServiceSelect = this.page.getByRole('option', { name: 'Divorce', exact: true }).locator('span').first();
  readonly caseTypeSelector = this.page.getByLabel('Matter Detail - Case Type_listbox').locator('div').filter({ hasText: 'Select One' });
  readonly caseTypeDecreeAbsoluteSelect = this.page.getByText('Decree Absolute');
  readonly regionSelector = this.page.getByRole('combobox', { name: 'Matter Detail - Region_listbox' }).locator('div').first();
  readonly regionWalesSelect = this.page.getByRole('option', { name: 'Wales' }).locator('span').first();
  readonly clusterSelect = this.page.getByRole('combobox', { name: 'Matter Detail - Cluster_listbox' }).locator('div').first();
  readonly clusterWalesTribSelect = this.page.getByText('Wales Civil, Family and Tribunals');
  readonly owningHearingSelector = this.page.getByLabel('Matter Detail - Owning Hearing Location_listbox').getByText('Select One');
  readonly owningCardiffCivilSelect = this.page.getByText('Cardiff Civil and Family');
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

  async selectDivorceService() {
    await this.serviceSelector.click();
    await this.divorceServiceSelect.click();
  }

  async selectDecreeAbsoluteCaseType() {
    await this.caseTypeSelector.click();
    await this.caseTypeDecreeAbsoluteSelect.click();
  }

  async selectWalesRegion() {
    await this.regionSelector.click();
    await this.regionWalesSelect.click();
  }

  async selectWalesFamilyTribunalCluster() {
    await this.clusterSelect.click();
    await this.clusterWalesTribSelect.click();
  }

  async selectCardiffCivilHearing() {
    await this.owningHearingSelector.click();
    await this.owningCardiffCivilSelect.click();
  }

  async populateNewCaseDetails(hmctsCaseNumber: string, caseName: string, jurisdiction: string) {
    await this.selectJurisdiction(jurisdiction);
    await this.selectDivorceService();
    await this.selectDecreeAbsoluteCaseType();
    await this.selectWalesRegion();
    await this.selectWalesFamilyTribunalCluster();
    await this.selectCardiffCivilHearing();
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
