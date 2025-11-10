import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";

process.env.SKIP_CREATE_CASE = "true";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Data Reporting @data-reporting", () => {
  test.describe.configure({ mode: "serial" });
  test.afterAll(() => {
    process.env.SKIP_CREATE_CASE = "false";
  });
  test("Invalid Mailbox report", async ({
    page,
    createUserPage,
    homePage,
    viewReportsPage,
  }) => {
    // Navigate to User Management Page
    await page.goto(config.urls.baseUrl);
    await homePage.sidebarComponent.openUserManagementPage();

    //look for invalidmailbox loginId
    await createUserPage.editUserButton.first().waitFor({ state: "visible" });
    await createUserPage.searchUserTxt.fill(
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER,
    );

    //checks the table has the correct data
    await expect(createUserPage.usersTable).toContainText(
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER,
    );
    //click edit button
    await createUserPage.editUserButton.first().click();

    //confirms correct user details are shown
    await page
      .locator("#personalDetails_givenNames")
      .waitFor({ state: "visible" });
    await expect(page.locator("#personalDetails_givenNames")).toHaveValue(
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_GIVEN_NAME,
    );
    await expect(page.locator("#personalDetails_surname")).toHaveValue(
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_LAST_NAME,
    );

    //set invalid mailbox flag and generate report
    await viewReportsPage.setInvalidMailboxCheckbox(
      true,
      createUserPage.CONSTANTS.INVALID_MAILBOX_RESOURCE_MANAGEMENT,
    );
    await viewReportsPage.openInvalidMailboxReportFormAndGenerateReport(
      true,
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_GIVEN_NAME,
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_LAST_NAME,
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_EMAIL,
    );

    //reset invalid mailbox flag for user and generate report
    await viewReportsPage.setInvalidMailboxCheckbox(
      false,
      createUserPage.CONSTANTS.INVALID_MAILBOX_RESOURCE_MANAGEMENT,
    );
    await viewReportsPage.openInvalidMailboxReportFormAndGenerateReport(
      false,
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_GIVEN_NAME,
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_LAST_NAME,
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_EMAIL,
    );
  });
});
