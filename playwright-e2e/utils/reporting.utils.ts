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
