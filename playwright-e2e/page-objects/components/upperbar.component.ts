import { Locator, Page } from "@playwright/test";

export class UpperbarComponent {
  readonly logoutButton = this.root.locator("#logout");

  //case buttons
  readonly currentCaseDropdownButton = this.page.locator(
    'a#currentMatter[role="link"][title="Current Case"]',
  );
  readonly currentCaseDropdownList = this.page.locator(
    "nav#vueNavbarCurrentMatter ul.sidebar-menu li a span span",
  );
  readonly closeCaseButton = this.root.locator("#closeApplication");

  //participant buttons
  readonly currentParticipantDropdownButton =
    this.page.locator("#currentEntity");
  readonly currentParticipantDropdownList = this.page.locator(
    "nav#vueNavbarEntity ul.sidebar-menu li",
  );
  readonly closeParticipantButton = this.root.locator("#closeEntity");

  //help button
  readonly helpButton = this.root.locator("#showHelpDialog");

  readonly currentParticipantDropDownItems = [
    "Details/Edit",
    "Participant History",
    "View Case Summary",
    "View Event Summary",
    "Create New Case",
    "View All Cases",
    "View Current Cases",
    "Unlock",
    "Close Participant",
  ];

  readonly currentCaseDropDownItems = [
    "Details/Edit",
    "Case History",
    "File Note",
    "Pending Activities",
    "File Movement",
    "List Case",
    "Allocate",
    "Alert",
    "Listing Requirements",
    "Record Disposal Schedule",
    "Unlock",
    "Close",
  ];

  constructor(
    private root: Locator,
    private page: Page,
  ) {}
}
