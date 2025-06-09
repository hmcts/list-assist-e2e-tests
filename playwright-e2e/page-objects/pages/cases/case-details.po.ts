import { expect, Page } from '@playwright/test';
import { Base } from '../../base';
import { EditNewCasePage } from './edit-case.po.ts';

export class CaseDetailsPage extends Base {
  readonly container = this.page.locator('#pageContent');
  readonly addToCartButton = this.page.locator('#header-bar-add-to-cart-icon');
  readonly additionalDetailsCard = this.page.locator('#matter-detail-summaryFields');
  readonly openListingDetails = this.page.getByRole('link', {
    name: 'Open listing details',
  });
  readonly headerTitle = this.page.locator('#header-title');
  readonly listingRequirementsHeader = this.page
    .getByRole('cell', { name: 'Listing Requirements' })
    .locator('#CMSHomeHeading');
  readonly hearingTypeSelect = this.page.getByLabel('Hearing Type');
  readonly saveButton = this.page.locator('#btnSave');
  readonly currentCaseCurrentStatusField = this.page.locator('#matter-detail-summaryField-4');
  readonly closeCaseButton = this.page.getByRole('link', {
    name: 'Close Case from top navigation',
  });
  readonly listingRequirementLink = this.page
    .locator('div#keyEventCard a:has-text("Listing Requirements - Listing Requirements")');

  constructor(page: Page) {
    super(page);
  }

  async waitForLoad(): Promise<void> {
    await expect
      .poll(
        async () => {
          return await this.additionalDetailsCard.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();
  }

  async isCaseListed(): Promise<boolean> {
    await this.waitForLoad();
    return await this.openListingDetails.isVisible();
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
    owningHearing: string,
  ) {
    //HMCTS case number
    await expect.soft(editNewCasePage.hmctsCaseNumberField).toHaveText('HMCTS Case Number ' + hmctsCaseNumber);
    //Case name
    await expect.soft(editNewCasePage.caseNameField).toHaveText('Case Name ' + caseName);
    //Jurisdiction
    await expect.soft(editNewCasePage.jurisdictionField).toHaveText('Jurisdiction ' + jurisdictionType);
    //Service
    await expect.soft(editNewCasePage.serviceField).toHaveText('Service ' + serviceType);
    //CaseType
    await expect.soft(editNewCasePage.caseTypeField).toHaveText('Case Type ' + caseType);
    //region
    await expect.soft(editNewCasePage.regionField).toHaveText('Region ' + region);
    //cluster
    await expect.soft(editNewCasePage.clusterField).toHaveText('Cluster ' + cluster);
    //owning hearing
    await expect.soft(editNewCasePage.owningHearingField).toHaveText('Owning Hearing Location ' + owningHearing);
  }

  async addCaseToCart() {
    await expect
      .poll(
        async () => {
          return await this.addToCartButton.click();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.addToCartButton.click();
  }
}
