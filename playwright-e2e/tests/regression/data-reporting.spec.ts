import { test, expect } from "../../fixtures.js";
import { config } from "../../utils/index.js";
import {
  clearDownSchedule,
  runAutomationBookingQueueJob,
} from "../../utils/reporting.utils.js";

test.describe("Data Reporting And Export @data-reporting", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(
    async ({
      page,
      loginPage,
      // addNewCasePage,
      // caseSearchPage,
      // editNewCasePage,
      // hearingSchedulePage,
    }) => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
      // //empties cart if there is anything present
      // await hearingSchedulePage.sidebarComponent.emptyCaseCart();
      // //search for the case
      // await addNewCasePage.sidebarComponent.openSearchCasePage();
      // await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
      // await expect(editNewCasePage.caseNameField).toHaveText(
      //   process.env.CASE_NAME as string,
      // );
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

  test("Data Export report @export", async ({
    addNewCasePage,
    caseSearchPage,
    sessionBookingPage,
    automaticBookingDashboardPage,
    dataUtils,
    hearingSchedulePage,
    editNewCasePage,
    viewReportsPage,
  }) => {
    // Test data
    const roomData = {
      roomName:
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
    };

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

    await runAutomationBookingQueueJob(automaticBookingDashboardPage);

    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await expect(editNewCasePage.caseNameField).toHaveText(
      process.env.CASE_NAME as string,
    );
    await caseSearchPage.addToCartButton.click();
    await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();

    //go to hearing schedule page
    await expect(hearingSchedulePage.sidebarComponent.sidebar).toBeVisible();
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();

    //schedule hearing
    await hearingSchedulePage.waitForLoad();

    await hearingSchedulePage.scheduleHearingWithBasket(
      roomData.roomName,
      roomData.column,
      roomData.caseNumber,
    );

    //session booking page
    await sessionBookingPage.bookSession(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
      `Automation internal comments ${process.env.HMCTS_CASE_NUMBER}`,
      `Automation external comments ${process.env.HMCTS_CASE_NUMBER}`,
      sessionBookingPage.CONSTANTS.AUTO_JUDICIAL_OFFICE_HOLDER_03,
    );

    await expect(hearingSchedulePage.header).toBeVisible();

    const report = await viewReportsPage.generateDataExportReport(
      dataUtils.generateDateInYyyyMmDdNoSeparators(0),
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );

    const expected = [
      {
        column: "JOH",
        value: viewReportsPage.CONSTANTS.DATA_EXPORT_REPORT_JOH_SALLY_LAVERNE,
      },
      {
        column: "Court",
        value: viewReportsPage.CONSTANTS.DATA_EXPORT_REPORT_COURT_NEWPORT_CCFC,
      },
      {
        column: "Room",
        value:
          viewReportsPage.CONSTANTS.DATA_EXPORT_REPORT_ROOM_NEWPORT_CHAMBERS_01,
      },
      {
        column: "Date",
        value: dataUtils.generateDobInDdMmYyyyForwardSlashSeparators(0),
      },
      { column: "Start", value: "10:00" },
      { column: "End", value: "11:00" },
      {
        column: "Subject",
        value: `${process.env.HMCTS_CASE_NUMBER as string} - ${process.env.CASE_NAME as string} - Allocation Hearing`,
      },
      { column: "Description", value: process.env.HMCTS_CASE_NUMBER as string },
      { column: "Location Comments", value: "Automation - Location Comment" },
      { column: "Case ID", value: process.env.HMCTS_CASE_NUMBER as string },
      { column: "Hearing ID", value: process.env.CASE_NAME as string },
      { column: "Hearing Type", value: "Allocation Hearing" },
      {
        column: "Case Comments",
        value: `Case Comment ${process.env.HMCTS_CASE_NUMBER as string}`,
      },
      {
        column: "Listing Comments",
        value: "Automation - Internal Case Comment",
      },
      {
        column: "Session Type",
        value:
          viewReportsPage.CONSTANTS
            .DATA_EXPORT_REPORT_SESSION_TYPE_ADHOC_AS_DIRECTED,
      },
      {
        column: "Jurisdiction",
        value: viewReportsPage.CONSTANTS.DATA_EXPORT_REPORT_JURISDICTION_FAMILY,
      },
      {
        column: "Case Service",
        value: viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
      },
      {
        column: "Case Type",
        value:
          viewReportsPage.CONSTANTS.DATA_EXPORT_REPORT_CASE_TYPE_SMALL_CLAIMS,
      },
    ];

    expect(report.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
      expect(report[i].column).toBe(expected[i].column);
      expect(report[i].value).toContain(expected[i].value);
    }
  });
});
