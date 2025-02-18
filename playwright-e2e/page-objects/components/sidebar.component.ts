import { Locator } from "@playwright/test";

export class SidebarComponent {
  readonly sidebar = this.root.locator("#pageNavigation");
  readonly hearingsMenu = this.root.locator("#hearing_menuItem");
  readonly hearingScheduleSubMenu = this.root.locator(
    "#hearingSchedule_subMenuItem"
  );
  readonly casesMenu = this.root.locator("#matter_menuItem");
  readonly caseSearchSubMenu = this.root.locator("#search_subMenuItem");

  constructor(private root: Locator) {}

  async openHearingSchedulePage() {
    await this.hearingsMenu.click();
    await this.hearingScheduleSubMenu.click();
  }

  async openSearchCasePage() {
    await this.casesMenu.click();
    await this.caseSearchSubMenu.click();
  }
}
