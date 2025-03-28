import {expect, Page} from "@playwright/test";
import { Base } from "../../base";
import {EditNewCasePage} from "./edit-case.po.ts";

export class CurrentCasePage extends Base {
  readonly headerTitle = this.page.locator('#header-title');
  readonly casesManu = this.page.locator("#matter_menuItem");
  readonly listingRequirementsHeader = this.page.getByRole('cell', { name: 'Listing Requirements' }).locator('#CMSHomeHeading');
  readonly hearingTypeSelect = this.page.getByLabel('Hearing Type');
  readonly saveButton = this.page.locator('#btnSave');
  readonly currentCaseCurrentStatusField = this.page.locator('#matter-detail-summaryField-4');
  readonly closeCaseButton = this.page.getByRole('link', { name: 'Close Case from top navigation' });

  constructor(page: Page) {
    super(page);
  }

  async checkInputtedCaseValues(
    editNewCasePage: EditNewCasePage,
    hmctsCaseNumber: string,
    caseName: string,
    jurisdictionType: string,
    serviceType: string,
    caseType: string,
    region: string,
    cluster: string,
    owningHearing: string) {

    //HMCTS case number
    await expect(editNewCasePage.hmctsCaseNumberField)
      .toHaveText("HMCTS Case Number " + hmctsCaseNumber);
    //Case name
    await expect(editNewCasePage.caseNameField).toHaveText("Case Name " + caseName)
    //Jurisdiction
    await expect(editNewCasePage.jurisdictionField)
      .toHaveText("Jurisdiction " + jurisdictionType)
    //Service
    await expect(editNewCasePage.serviceField)
      .toHaveText("Service " + serviceType)
    //CaseType
    await expect(editNewCasePage.caseTypeField)
      .toHaveText("Case Type " + caseType)
    //region
    await expect(editNewCasePage.regionField)
      .toHaveText("Region " + region)
    //cluster
    await expect(editNewCasePage.clusterField)
      .toHaveText("Cluster " + cluster)
    //owning hearing
    await expect(editNewCasePage.owningHearingField)
      .toHaveText("Owning Hearing Location " + owningHearing)
  }

}
