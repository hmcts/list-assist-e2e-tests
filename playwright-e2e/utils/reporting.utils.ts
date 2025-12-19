export async function clearDownSchedule(
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

export async function runAutomationBookingQueueJob(
  automaticBookingDashboardPage,
) {
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
}
