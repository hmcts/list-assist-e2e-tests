export async function clearDownSchedule(
  sessionBookingPage,
  hearingSchedulePage,
  caseListingRegion,
  caseListingCluster,
  caseListingLocality,
  caseListingLocation,
  sessionDetailsCanxCode,
  date,
  dateFrom?,
  dateTo?,
) {
  await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

  if (dateFrom) {
    await hearingSchedulePage.waitForLoad();
    await hearingSchedulePage.primaryFilterToggleButton.click();
    await hearingSchedulePage.primaryFilterFromDateInput.click();
    await hearingSchedulePage.primaryFilterDateInput(dateFrom).click();
    await hearingSchedulePage.primaryFilterDateInput(dateTo).click();
    await hearingSchedulePage.applyPrimaryFilterButton.click();
  }

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
