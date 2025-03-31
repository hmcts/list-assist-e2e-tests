import { Locator } from "@playwright/test";
import { expect } from "../../fixtures.ts";

export class SidebarComponent {
  readonly sidebar = this.root.locator("#pageNavigation");
  readonly hearingsMenu = this.root.locator("#hearing_menuItem");
  readonly hearingScheduleSubMenu = this.root.locator(
    "#hearingSchedule_subMenuItem"
  );
  readonly casesMenu = this.root.locator("#matter_menuItem");
  readonly caseSearchSubMenu = this.root.locator("#search_subMenuItem");
  readonly caseAddNew = this.root.locator("#addNew_subMenuItem");
  readonly currentCaseSubMenu = this.root.locator("#currentMatter_subMenuItem");
  readonly currentCaseDetailsEdit = this.root.locator(
    "#detailsEdit_subMenuItem"
  );
  readonly listingRequirementsSubmenu = this.root.locator(
    "#listingRequirements_subMenuItem"
  );

  constructor(private root: Locator) {}

  async openHearingSchedulePage() {
    await this.hearingsMenu.click();
    await this.hearingScheduleSubMenu.click();
  }

  async openSearchCasePage() {
    await this.casesMenu.click();
    await this.caseSearchSubMenu.click();
  }

  async openAddNewCasePage() {
    await this.casesMenu.click();
    await this.caseAddNew.click();
  }

  async openListingRequirementsPage() {
    await expect
      .poll(
        async () => {
          await this.casesMenu.click();
          return await this.currentCaseSubMenu.isVisible();
        },
        {
          timeout: 10_000,
        }
      )
      .toBeTruthy();

    await expect
      .poll(
        async () => {
          await this.currentCaseSubMenu.click();
          return await this.listingRequirementsSubmenu.isVisible();
        },
        {
          timeout: 10_000,
        }
      )
      .toBeTruthy();

    await this.listingRequirementsSubmenu.click();
  }

  async openCaseDetailsEditPage() {
    await expect
      .poll(
        async () => {
          await this.casesMenu.click();
          return await this.currentCaseSubMenu.isVisible();
        },
        {
          timeout: 10_000,
        }
      )
      .toBeTruthy();

    await this.currentCaseSubMenu.click();
    await this.currentCaseDetailsEdit.click();
  }
}
