import { Page, expect } from "@playwright/test";
import { Base } from "../../base";

interface CaseData {
  jurisdiction: string;
  service: string;
  caseType: string;
  region: string;
  hearingCentre: string;
}

export class AddNewCasePage extends Base {
  readonly CONSTANTS = {
    HMCTS_CASE_NUMBER_HEADER_VALUE: "HMCTS Case Number",
    CASE_NAME_HEADER_VALUE: "Case Name",
    JURISDICTION_FAMILY: "Family",
    JURISDICTION_FAMILY_REFERENCE: "AB",
    JURISDICTION_CIVIL: "Civil",
    JURISDICTION_CIVIL_REFERENCE: "AA",
    SERVICE_DIVORCE: "Divorce",
    SERVICE_DAMAGES: "Damages",
    SERVICE_DAMAGES_REFERENCE: "AAA7",
    DECREE_ABSOLUTE_CASE_TYPE: "Decree Absolute",
    DECREE_ABSOLUTE_CASE_TYPE_REFERENCE: "ABA5-PRL",
    CASE_TYPE_SMALL_CLAIMS: "Small Claims",
    CASE_TYPE_SMALL_CLAIMS_REFERENCE: "AAA7-SMALL_CLAIM",
    LOCATION_ID_CARDIFF_CCJGC: "234850",
    REGION_WALES: "Wales",
    CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS: "Wales Civil, Family and Tribunals",
    HEARING_CENTRE_CARDIFF: "Cardiff Civil and Family Justice Centre",
    CURRENT_STATUS_AWAITING_LISTING: "Awaiting Listing",
    HEARING_TYPE_APPLICATION_REF: "449628128",
    ENTITY_TYPE_CODE_IND: "IND",
    ENTITY_TYPE_CODE_ORG: "ORG",
    ENTITY_ROLE_CODE_CLAI: "CLAI",
    ENTITY_ROLE_CODE_DEFE: "DEFE",
    LOCATION_TYPE_REFERENCE_EPIMS: "EPIMS",
    LISTING_TYPE_DAMAGES: "AAA7-TRI",
  };

  //new case page
  readonly newCaseHeader = this.page.locator("h1.header-title.my-2");
  readonly jurisdictionSelector = this.page
    .getByLabel("Jurisdiction")
    .getByText("Select One");

  readonly serviceCombo = this.page
    .locator("#matter-detail-matterDetailsCard")
    .getByRole("combobox", { name: "Service list" });

  readonly serviceListbox = this.page.locator(
    "#matter-detail-matterDetailsCard #mtrCategoryId_listbox",
  );

  readonly caseTypeSelector = this.page
    .locator("#matter-detail-matterDetailsCard")
    .getByRole("combobox", { name: "Case Type list" });

  readonly caseTypeListbox = this.page.locator(
    "#matter-detail-matterDetailsCard #mtrMatterCdId_listbox",
  );

  readonly regionSelector = this.page
    .getByRole("combobox", { name: "Region" })
    .locator("div")
    .first();

  // readonly clusterSelect = this.page
  //   .getByRole("combobox", { name: "Cluster" })
  //   .locator("div")
  //   .first();
  //

  readonly card = this.page.locator("#matter-detail-matterDetailsCard");

  readonly clusterSelect = this.card.getByRole("combobox", {
    name: "Cluster list",
  });
  readonly clusterListbox = this.card.locator("#registry_listbox");

  readonly owningHearingSelector = this.page
    .getByLabel("Owning Hearing Location")
    .getByText("Select One");
  readonly commentInput = this.page.locator("#mtrComment");
  readonly hmctsCaseNumberInput = this.page.locator("#mtrNumberAdded");
  readonly enterNameInput = this.page.locator("#mtrAltTitleTxt");
  readonly saveButton = this.page.getByRole("button", {
    name: "Save Case",
    exact: true,
  });

  constructor(page: Page) {
    super(page);
  }

  async selectJurisdiction(jurisdiction: string) {
    await this.jurisdictionSelector.click();
    await this.page
      .getByRole("option", { name: jurisdiction, exact: true })
      .locator("span")
      .first()
      .click();
  }

  async selectService(service: string) {
    await this.serviceCombo.click();
    await this.serviceListbox
      .getByRole("option", { name: service, exact: true })
      .click();
  }

  async selectCaseType(caseType: string) {
    await this.caseTypeSelector.click();
    await this.caseTypeListbox
      .getByRole("option", { name: caseType, exact: true })
      .click();
  }

  async selectRegion(region: string) {
    await this.regionSelector.click();
    await this.page
      .getByRole("option", { name: region })
      .locator("span")
      .first()
      .click();
  }

  async selectCluster(cluster: string) {
    console.log("Selecting cluster: " + cluster);
    // const card = this.page.locator("#matter-detail-matterDetailsCard");
    // const combo = card.getByRole("combobox", { name: "Cluster list" });
    // const listbox = card.locator("#registry_listbox");
    //
    // await combo.click();
    //
    // const option = listbox.locator("span.multiselect__option", { hasText: cluster }).first();
    // await option.hover();                 // make it the active highlighted option
    // await this.page.keyboard.press("Enter"); // commit selection
    //
    // await expect(combo).toContainText(cluster, { timeout: 10_000 });
  }

  // async selectCluster(cluster: string) {
  //   await this.clusterSelect.click();
  //   await this.page.getByText(cluster).click();
  // }

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
    owningHearing: string,
  ) {
    await this.selectJurisdiction(jurisdiction);
    await this.selectService(service);
    await this.selectCaseType(caseType);
    await this.selectRegion(region);
    await this.selectOwningHearing(owningHearing);
    await this.hmctsCaseNumberInput.fill(hmctsCaseNumber);
    await this.enterNameInput.fill(caseName);
  }

  async addNewCaseWithMandatoryData(
    caseData: CaseData,
    hmctsCaseNumber: string,
    caseName: string,
  ) {
    // Assert that the header contains the text 'New Case'
    await expect(this.newCaseHeader).toHaveText("New Case");
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

    await expect(
      this.newCaseHeader.filter({ hasText: caseName }),
    ).toBeVisible();
  }
}
