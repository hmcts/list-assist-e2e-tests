import { Page, expect } from "@playwright/test";
import { Base } from "../../base";

export class CreateUserPage extends Base {
  readonly CONSTANTS = {
    INVALID_MAILBOX_RESOURCE_MANAGEMENT: "INVALID MAILBOX",
    INVALID_MAILBOX_USER_LAST_NAME: "MAILBOX",
    INVALID_MAILBOX_USER_GIVEN_NAME: "INVALID",
    INVALID_MAILBOX_USER_EMAIL: "invalidmailbox@test.com",
    INVALID_MAILBOX_USER: "invalidmailbox",
  };

  //users table
  readonly usersTable = this.page.locator("#usersTable tbody");
  //user details
  readonly createUserButton = this.page.locator("#createNewUser");
  readonly userLoginId = this.page.locator("#userDetailsLoginID");
  readonly userEmail = this.page.locator("#userDetailsEmail");
  readonly userPassword = this.page.locator("#userDetailsPassword");
  readonly userConfirmPassword = this.page.locator(
    "#userDetailsConfirmPassword",
  );
  readonly userGivenName = this.page.locator("#userDetailsGivenNames");
  readonly userSurName = this.page.locator("#userDetailsSurname");
  readonly userDetailLabel = this.page.locator("text=User Details");
  readonly searchUserTxt = this.page.locator("#searchUser");
  readonly systemDetailTab = this.page.locator("#systemDetailsBtn");
  readonly userActiveFromDate = this.page.locator("#systemDetails_activeFrom");
  readonly userActiveToDate = this.page.locator("#systemDetails_activeTo");
  readonly resourceManagementLabel = this.page.locator(
    "text=Resource Management",
  );
  readonly jurisdictionTab = this.page.locator("#jurisdictionsBtn");
  readonly addJurisdictionBtn = this.page.locator(
    "#jurisdictionsTable_addNewJurisdiction",
  );
  readonly userDetailSaveButton = this.page.locator("#saveUserDetails");
  readonly userSystemDetailSaveButton = this.page.locator("#saveUser");
  readonly editUserButton = this.page.locator(
    '#usersList .vuetable-slot.table-actions button[role="link"]',
    { hasText: "Edit" },
  );

  //edit user page
  readonly editUserGivenNames = this.page.locator(
    "#personalDetails_givenNames",
  );
  readonly editUserSurname = this.page.locator("#personalDetails_surname");

  constructor(page: Page) {
    super(page);
  }

  async selectRegion(regionName: string) {
    const regionDropdownToggle = this.page
      .locator('[role="group"][aria-label^="Regions filter list"]')
      .locator('[aria-label="Open listbox"]')
      .first();

    await regionDropdownToggle.click();

    const regionListbox = this.page.locator("#userDetailsAreas_listbox");
    const regionOption = regionListbox.locator(
      `.multiselect__option:has-text("${regionName}")`,
    );
    await regionOption.click();
  }

  async selectCluster(clusterName: string) {
    const clusterSelect = this.page.locator(".form-group.single-select", {
      hasText: "Primary Clusters",
    });

    const combo = clusterSelect.locator('[role="combobox"]');
    await combo.click();

    await this.page
      .locator("#userDetailsPrimaryRegistry_listbox")
      .locator("span.multiselect__option", { hasText: clusterName })
      .first()
      .click();

    await expect(combo).toContainText(clusterName);
  }

  //#userDetailsPrimaryRegistry_listbox

  async selectSecurityGroup(securityGroupName: string) {
    const securityGroupToggle = this.page
      .locator('.multiselect[aria-owns="systemDetails_securityGroups_listbox"]')
      .locator('[aria-label="Open listbox"]');
    await securityGroupToggle.click();
    const securityGroupOption = this.page.locator(
      `.multiselect__option:has-text("${securityGroupName}")`,
    );
    await securityGroupOption.click();
  }

  async selectJurisdiction(jurisdictionName: string) {
    const jurisdictionDropdown = this.page.locator(
      '[aria-owns="jurisdiction_jurisdictionCode_listbox"]',
    );
    await jurisdictionDropdown.click();
    const jurisdictionListBox = this.page.locator(
      "#jurisdiction_jurisdictionCode_listbox",
    );
    const civilOption = jurisdictionListBox.getByText(jurisdictionName, {
      exact: true,
    });
    await civilOption.click();
    const jurisdictionApplyButton = this.page.locator("#apply");
    await jurisdictionApplyButton.click();
  }

  async selectLocality(localityName: string) {
    const localityDropdownToggle = this.page.locator(
      '[aria-owns="systemDetails_hsLocalities_listbox"] .multiselect__custom-select',
    );
    await localityDropdownToggle.click();
    const localitiesListBox = this.page.locator(
      "#systemDetails_hsLocalities_listbox",
    );
    const localityOption = localitiesListBox.getByText(`${localityName}`, {
      exact: true,
    });
    await localityOption.click();
  }

  async selectSecurityType(securityTypeName: string) {
    const securityTypeContainer = this.page
      .locator('[aria-owns="systemDetails_securityType_listbox"]')
      .locator(".multiselect__select");
    await securityTypeContainer.click();
    const securityTypeListBox = this.page.locator(
      "#systemDetails_securityType_listbox",
    );
    const option = securityTypeListBox.getByText(`${securityTypeName}`, {
      exact: true,
    });
    await option.click();
  }
}
