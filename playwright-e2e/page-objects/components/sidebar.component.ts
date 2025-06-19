import { Locator, Page } from "@playwright/test";
import { expect } from "../../fixtures.ts";

export class SidebarComponent {
  readonly sidebar = this.root.locator("#pageNavigation");
  readonly backToMenuButton = this.root.locator(
    'div.sidepanel-card--topheader:has-text("Back to menu")',
  );

  //hearing menu
  readonly hearingsMenu = this.root.locator("#hearing_menuItem");
  readonly hearingScheduleSubMenu = this.root.locator(
    "#hearingSchedule_subMenuItem",
  );

  //cases manu
  readonly casesMenu = this.root.locator("#matter_menuItem");
  readonly caseSearchSubMenu = this.root.locator("#search_subMenuItem");
  readonly caseAddNew = this.root.locator("#addNew_subMenuItem");
  readonly currentCaseSubMenu = this.root.locator("#currentMatter_subMenuItem");
  readonly currentCaseDetailsEdit = this.root.locator(
    "#detailsEdit_subMenuItem",
  );
  readonly caseHeader = this.page.locator("#CMSHomeHeading");

  //listing requirements menu
  readonly listingRequirementsSubmenu = this.root.locator(
    "#listingRequirements_subMenuItem",
  );

  //participant menu
  readonly participantsMenu = this.root.locator("#entity_menuItem");
  readonly addNewParticipant = this.root.locator("#addAnEntity_subMenuItem");

  //administration menu
  readonly administrationMenu = this.root.locator("#maintenance_menuItem");
  readonly automaticBookingDashboardButton = this.root.locator(
    "#automaticBookingDashboard_subMenuItem",
  );
  readonly scheduledJobsButton = this.root.locator(
    "#scheduledJobs_subMenuItem",
  );
  readonly scheduledJobsHeader = this.root.locator("#CMSHomeHeading", {
    hasText: "Scheduled Jobs",
  });

  //case cart
  readonly modal = this.page.locator(".modal-content");
  readonly cartCounterLabel = this.page.locator(".cart-counter-label");
  readonly emptyCartButton = this.page.getByRole("button", {
    name: "Empty Cart",
  });
  readonly cartButton = this.page.locator("#cart");

  //multi-day case cart
  readonly multiDayCartSidebarButton = this.page.locator(
    'a#multiDayCart_menuItem[title="Multi Day Cart"]',
  );
  readonly multiDayCartSubMenuButton = this.page.locator(
    'div.sidebar-submenu ul.sidebar-submenu__content a#multiDay[title="Multi Day"]',
  );
  readonly emptyMultiSessionCartButton = this.page.locator(
    'a#emptySessionCart[title="Empty Session Cart"]',
  );
  readonly multiDayCartCounterLabel = this.page.locator(
    ".cart-counter .cart-counter-label",
  );

  constructor(
    private root: Locator,
    private page: Page,
  ) {}

  async openHearingSchedulePage() {
    await expect
      .poll(
        async () => {
          await this.hearingsMenu.click();
          return await this.hearingScheduleSubMenu.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.hearingsMenu.click();
    await this.hearingScheduleSubMenu.click();
  }

  async openSearchCasePage() {
    await expect
      .poll(
        async () => {
          await this.casesMenu.click();
          return await this.caseSearchSubMenu.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

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
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await expect
      .poll(
        async () => {
          await this.currentCaseSubMenu.click();
          return await this.listingRequirementsSubmenu.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.listingRequirementsSubmenu.click();
  }

  async openCaseDetailsEditPage() {
    // TODO: Replace implicit wait
    await this.page.waitForTimeout(3_000);
    await expect
      .poll(
        async () => {
          await this.casesMenu.click();
          return await this.currentCaseSubMenu.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.currentCaseSubMenu.click();
    await this.currentCaseDetailsEdit.click();
  }

  async openAddNewParticipantPage() {
    await expect
      .poll(
        async () => {
          await this.participantsMenu.click();
          return await this.addNewParticipant.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.participantsMenu.click();
    await this.addNewParticipant.click();
  }

  async openAutomaticBookingDashboard() {
    await expect
      .poll(
        async () => {
          await this.administrationMenu.click();
          return await this.automaticBookingDashboardButton.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.automaticBookingDashboardButton.click();
  }

  async openScheduledJobsPage() {
    await expect
      .poll(
        async () => {
          await this.administrationMenu.click();
          return await this.scheduledJobsButton.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.scheduledJobsButton.click();
    await expect(this.scheduledJobsHeader).toBeVisible();
  }

  async emptyCaseCart() {
    if (await this.cartButton.isEnabled()) {
      await this.cartButton.click();
      await this.emptyCartButton.click();
      await this.modal.getByRole("button", { name: "Yes" }).click();
      await expect(this.cartCounterLabel).toBeHidden();
      await this.backToMenuButton.click();
    }
  }

  async checkCartButtonEnabled() {
    await expect
      .poll(
        async () => {
          return await this.cartButton.isEnabled();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();
  }

  async checkCartButtonDisabled() {
    await expect
      .poll(
        async () => {
          return await this.cartButton.isEnabled();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeFalsy();
  }

  async checkMultiDayCartButtonEnabled() {
    await expect
      .poll(
        async () => {
          return await this.multiDayCartCounterLabel.first().isEnabled();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();
  }

  async checkMultiDayCartNumberIsPresent() {
    // Assert that the label contains a number between 1 and 5
    const count = parseInt(
      (await this.multiDayCartCounterLabel.first().textContent()) || "",
      10,
    );
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(5);
  }

  async openMultiDayCart() {
    await this.multiDayCartSidebarButton.click();

    await expect
      .poll(
        async () => {
          return await this.multiDayCartSubMenuButton.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.multiDayCartSubMenuButton.click();
  }
}
