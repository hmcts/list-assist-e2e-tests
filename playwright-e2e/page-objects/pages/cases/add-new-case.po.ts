import { Page, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { Base } from "../../base";
import { HomePage } from "../home.po";
import { HearingSchedulePage } from "../hearings/hearing-schedule.po";

interface CaseData {
  jurisdiction: string;
  service: string;
  caseType?: string;
  region: string;
  hearingCentre: string;
  hmctsCaseNumber?: string;
  caseName?: string;
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
    SERVICE_PRIVATE_LAW: "Private Law",
    SERVICE_DAMAGES_REFERENCE: "AAA7",
    SERVICE_FINANCIAL_DISPUTE: "Financial Dispute",
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

  readonly card = this.page.locator("#matter-detail-matterDetailsCard");

  readonly clusterSelect = this.card.getByRole("combobox", {
    name: "Cluster list",
  });
  readonly clusterListbox = this.card.locator("#registry_listbox");

  readonly owningHearingSelector = this.page
    .getByRole("combobox", { name: "Owning Hearing Location" })
    .locator("div")
    .first();
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

  // keeping this method for future use if needed. in 4.67 the autopopulated cluster require a double select to set the value
  async selectCluster(cluster: string) {
    await this.clusterSelect.click();
    await this.page.getByText(cluster).click();
    await this.clusterSelect.click();
    await this.page.getByText(cluster).click();
  }

  async selectOwningHearing(owningHearing: string) {
    const currentValue = await this.owningHearingSelector.textContent();
    if (currentValue?.trim() !== owningHearing) {
      await this.owningHearingSelector.click();
      await this.page.getByText(owningHearing, { exact: true }).click();
    }
  }

  async populateNewCaseDetails(
    hmctsCaseNumber: string,
    caseName: string,
    jurisdiction: string,
    service: string,
    caseType: string | undefined,
    region: string,
    owningHearing: string,
  ) {
    await this.selectJurisdiction(jurisdiction);
    await this.selectService(service);
    if (caseType) {
      await this.selectCaseType(caseType);
    }
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

  /**
   * caseData object format:
   * {
   *   jurisdiction: string,        // e.g., "Civil" or "Family"
   *   service: string,             // e.g., "Damages" or "Divorce"
   *   caseType?: string,           // (optional) e.g., "Small Claims"
   *   region: string,              // e.g., "Wales" or "London"
   *   hearingCentre: string,       // e.g., "Cardiff Civil and Family Justice Centre"
   *   hmctsCaseNumber?: string,    // (optional) e.g., "1234567890" - auto-generated if not provided
   *   caseName?: string            // (optional) e.g., "Smith v Jones" - auto-generated if not provided
   * }
   */

  async addNewCase(
    homePage: HomePage,
    hearingSchedulePage: HearingSchedulePage,
    caseData?: CaseData,
  ): Promise<{ caseNumber: string; caseName: string }> {
    // Empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    // Navigate to Add New Case page
    await homePage.sidebarComponent.openAddNewCasePage();

    // Generate case details (use overrides from caseData if provided)
    const caseNumber =
      caseData?.hmctsCaseNumber ?? "HMCTS_CN_" + randomUUID().toUpperCase();
    const caseName = caseData?.caseName ?? "AUTO_" + randomUUID().toUpperCase();

    process.env.HMCTS_CASE_NUMBER = caseNumber;
    process.env.CASE_NAME = caseName;

    // Use provided caseData or default data
    const finalCaseData: CaseData = caseData || {
      jurisdiction: this.CONSTANTS.JURISDICTION_CIVIL,
      service: this.CONSTANTS.SERVICE_DAMAGES,
      caseType: this.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
      region: this.CONSTANTS.REGION_WALES,
      hearingCentre: this.CONSTANTS.HEARING_CENTRE_CARDIFF,
    };

    // Create the new case
    await this.addNewCaseWithMandatoryData(finalCaseData, caseNumber, caseName);

    return { caseNumber, caseName };
  }
}
