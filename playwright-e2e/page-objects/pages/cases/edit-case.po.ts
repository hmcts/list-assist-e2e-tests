import { Page } from "@playwright/test";
import { Base } from "../../base";

export class EditNewCasePage extends Base {

    readonly newCaseHeader = this.page.locator('h1.header-title.my-2');
    readonly hmctsCaseNumberField = this.page.locator("#matter-detail-mtrNumberAdded");
    readonly caseNameField = this.page.locator("#matter-detail-mtrAltTitleTxt");
    readonly jurisdictionField = this.page.locator("#matter-detail-mtrJsCodeId");
    readonly serviceField = this.page.locator("#matter-detail-mtrCategoryId");
    readonly caseTypeField = this.page.locator("#matter-detail-mtrMatterCdId");
    readonly regionField = this.page.locator("#matter-detail-areaCode");
    readonly clusterField = this.page.locator("#matter-detail-registry");
    readonly owningHearingField = this.page.locator("#matter-detail-homeLocationId");


  constructor(page: Page) {
    super(page);
  }
}
