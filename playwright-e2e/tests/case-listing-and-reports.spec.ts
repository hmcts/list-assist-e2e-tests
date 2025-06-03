import { expect, test } from '../fixtures';
import { config } from '../utils';

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe('Case listing and reports via Reports Menu @case-listing', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, hearingSchedulePage, addNewCasePage, caseSearchPage }) => {
    await page.goto(config.urls.baseUrl);
    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.CASE_NAME as string);
  });

  test('List "Released" session and Generate report via reports menu', async ({
    sessionBookingPage,
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
  }) => {
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS.CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    );

    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    );

    // Test data
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await caseDetailsPage.createHearingSession(
      process.env.CASE_NAME as string,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      roomData,
      sessionBookingPage,
    );

    //test data
    const reportData = {
      //numeric, current day of the month
      dateFrom: dataUtils.generateDateInYyyyMmDdNoSeparators(0),
      dateTo: dataUtils.generateDateInYyyyMmDdNoSeparators(1),

      locality: viewReportsPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      location: viewReportsPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
      service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
    };

    //open reports menu and check generated report
    await viewReportsPage.reportRequestPageActions(
      reportData.dateFrom,
      reportData.dateTo,
      reportData.locality,
      reportData.location,
      reportData.jurisdiction,
      reportData.service,
      dataUtils.getFormattedDateForReportAssertion(),
    );
  });

  test('List "Released" session and Generate report via P&I Dashboard. Run and confirm scheduled job is completed', async ({
    sessionBookingPage,
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    automaticBookingDashboardPage,
    dataUtils,
  }) => {
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS.CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );

    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );

    //run scheduled jobs so there are no queued reports
    //open scheduled jobs page
    await automaticBookingDashboardPage.sidebarComponent.openScheduledJobsPage();
    //run the job
    await automaticBookingDashboardPage.clickRunForAutomaticBookingQueueJob(
      automaticBookingDashboardPage.CONSTANTS.SCHEDULE_JOBS_AUTOMATIC_BOOKING_QUEUE_JOB,
    );
    //check the header is present after page has refreshed
    await automaticBookingDashboardPage.sidebarComponent.scheduledJobsHeader.isVisible();

    // Test data
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
      jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
      service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await caseDetailsPage.createHearingSession(
      process.env.CASE_NAME as string,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      roomData,
      sessionBookingPage,
    );

    await homePage.sidebarComponent.openAutomaticBookingDashboard();
    await automaticBookingDashboardPage.createPublishExternalListsHeader.isVisible();
    await automaticBookingDashboardPage.publishExternalListsCreate.click();

    await automaticBookingDashboardPage.populateCreatePublishExternalListsForm(
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_REGION_WALES,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      roomData.jurisdiction,
      roomData.service,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_DAILY_MIXED_CAUSE_LIST_SSRS,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_VERSION_TYPE,
    );

    //assert that the report preview is generated and contains expected elements
    await automaticBookingDashboardPage.assertPreviewReport(
      dataUtils.getFormattedDateForReportAssertion(),
      automaticBookingDashboardPage.CONSTANTS.CIVIL_AND_FAMILY_DAILY_CAUSE_LIST,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );

    let jobRun = 'false';

    //assert publish button is now visible
    await expect(automaticBookingDashboardPage.publishButton).toBeVisible();
    //click publish button
    await automaticBookingDashboardPage.publishButton.click();
    //wait for 'Previous Publish External List header' to be visible
    await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
    //checks that report is queued
    await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
      jobRun,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
    );
    //closes the publish external list popup
    await automaticBookingDashboardPage.closePublishExternalListButton.click();

    //run scheduled jobs
    //open scheduled jobs page
    await automaticBookingDashboardPage.sidebarComponent.openScheduledJobsPage();
    //run the job
    await automaticBookingDashboardPage.clickRunForAutomaticBookingQueueJob(
      automaticBookingDashboardPage.CONSTANTS.SCHEDULE_JOBS_AUTOMATIC_BOOKING_QUEUE_JOB,
    );
    jobRun = 'true';

    //check the header is present after page has refreshed
    await automaticBookingDashboardPage.sidebarComponent.scheduledJobsHeader.isVisible();

    //checks that report has now been removed from queue
    await automaticBookingDashboardPage.sidebarComponent.openAutomaticBookingDashboard();
    await automaticBookingDashboardPage.publishExternalListsView.click();
    //wait for 'Previous Publish External List header' to be visible
    await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
    await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
      jobRun,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
    );
  });
});
