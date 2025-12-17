import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";

test.describe("Data Reporting And Export @data-reporting", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(
    async ({
      page,
      loginPage,
      addNewCasePage,
      caseSearchPage,
      editNewCasePage,
      hearingSchedulePage,
    }) => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
      //empties cart if there is anything present
      await hearingSchedulePage.sidebarComponent.emptyCaseCart();
      //search for the case
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
      await expect(editNewCasePage.caseNameField).toHaveText(
        process.env.CASE_NAME as string,
      );
    },
  );
  test("Invalid Mailbox report", async ({
    createUserPage,
    homePage,
    viewReportsPage,
  }) => {
    // Navigate to User Management Page
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
    await createUserPage.editUserGivenNames.waitFor({ state: "visible" });
    await expect(createUserPage.editUserGivenNames).toHaveValue(
      createUserPage.CONSTANTS.INVALID_MAILBOX_USER_GIVEN_NAME,
    );
    await expect(createUserPage.editUserSurname).toHaveValue(
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

  test("Data Export Report @export", async ({
    addNewCasePage,
    caseSearchPage,
    sessionBookingPage,
    automaticBookingDashboardPage,
    dataUtils,
    hearingSchedulePage,
  }) => {
    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

    await clearDownSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );

    //run scheduled jobs so there are no queued reports
    //open scheduled jobs page
    await automaticBookingDashboardPage.sidebarComponent.openScheduledJobsPage();
    //run the job
    await automaticBookingDashboardPage.clickRunForAutomaticBookingQueueJob(
      automaticBookingDashboardPage.CONSTANTS
        .SCHEDULE_JOBS_AUTOMATIC_BOOKING_QUEUE_JOB,
    );
    //check the header is present after page has refreshed
    await automaticBookingDashboardPage.sidebarComponent.scheduledJobsHeader.isVisible();
  });
});

async function clearDownSchedule(
  sessionBookingPage,
  hearingSchedulePage,
  caseListingRegion,
  caseListingCluster,
  caseListingLocality,
  caseListingLocation,
  sessionDetailsCanxCode,
  date,
) {
  await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

  await sessionBookingPage.updateAdvancedFilterConfig(
    caseListingRegion,
    caseListingCluster,
    caseListingLocality,
    caseListingLocation,
  );

  await hearingSchedulePage.clearDownSchedule(
    sessionDetailsCanxCode,
    caseListingLocation,
    date,
  );
}
