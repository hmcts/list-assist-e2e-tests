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

export async function clearDownScheduleFromSessionSummary(
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

  await hearingSchedulePage.clearDownScheduleFromSessionSummary(
    sessionDetailsCanxCode,
    caseListingLocation,
    date,
  );
}
