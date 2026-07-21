import { test, expect } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import { clearDownScheduleFromSessionSummary } from "../../utils/cleardown.utils.ts";
import type { NewUiSessionBookingPage } from "../../page-objects/pages/hearings/new-ui-session-booking.po.ts";

test.describe("New hearing session UI - check create session @new-ui @regression", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login("ROBERT_SULLIVAN");
  });

  test("List session with basketed case: book with pre-populated data, manage breaks and panel member, then edit and verify", async ({
    page,
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
    addNewCasePage,
    homePage,
    caseSearchPage,
    caseDetailsPage,
    newUiSessionBookingPage,
  }) => {
    await test.step("Clean down schedule for Haverfordwest County and Family, Haverfordwest Courtroom 1", async () => {
      await clearDownScheduleFromSessionSummary(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    });

    await test.step("Add a case with default arguments and add it to basket", async () => {
      await addNewCasePage.addNewCase(homePage, hearingSchedulePage);
      await caseDetailsPage.addToCartButton.click();
      await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();
    });

    await test.step("Open hearing schedule and set advanced filters", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await sessionBookingPage.updateAdvancedFilterConfig(
        undefined,
        undefined,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
      );
    });

    await test.step("Apply today's date filter", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await hearingSchedulePage.applyPrimaryDateFilter(
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    });

    await test.step("Schedule hearing with basketed case", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await hearingSchedulePage.scheduleHearingWithBasket(
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
        sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
        process.env.CASE_NAME as string,
      );
    });

    await newUiSessionBookingPage.assertSessionBookingDetailsUiElementsVisible();
    await assertStartDateFieldPopulated(newUiSessionBookingPage, true);
    await assertStartAndEndTimesPopulated(newUiSessionBookingPage, true);
    await assertLocalityAndLocationPopulated(newUiSessionBookingPage, true);
    await assertSessionStatusPopulated(newUiSessionBookingPage);
    await selectSessionType(newUiSessionBookingPage);
    await selectDefaultListingDuration(newUiSessionBookingPage);
    await runSessionBreakFlow(newUiSessionBookingPage);
    await fillInternalAndExternalComments(
      newUiSessionBookingPage,
      `${newUiSessionBookingPage.CONSTANTS.INTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
      `${newUiSessionBookingPage.CONSTANTS.EXTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
    );
    await addPanelMemberAndSelectHearingType(
      newUiSessionBookingPage,
      newUiSessionBookingPage.CONSTANTS.PANEL_MEMBER_AMANDA_FOSTER,
    );
    await saveSessionAndSelectHearingType(newUiSessionBookingPage);

    await test.step("Confirm listing has been created", async () => {
      await expect(
        hearingSchedulePage.confirmListingReleasedStatus,
      ).toBeVisible();
    });

    await test.step("Open hearing schedule and set advanced filters", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await sessionBookingPage.updateAdvancedFilterConfig(
        undefined,
        undefined,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
      );

      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    });

    await test.step("Click on the newly created session", async () => {
      await hearingSchedulePage.confirmListingReleasedStatus.click();
    });

    await test.step("Click on CASE_NAME in the expanded session", async () => {
      await hearingSchedulePage
        .getListingByCaseName(process.env.CASE_NAME as string)
        .click();
    });

    await test.step("Click Edit Session in the summary box", async () => {
      await hearingSchedulePage.goToSessionDetailsButton.click();
    });

    await test.step("Confirm Session Booking heading is present", async () => {
      await expect(sessionBookingPage.heading).toBeVisible();
    });

    await test.step("Validate Session Booking Details section is visible in edit mode", async () => {
      await expect(
        newUiSessionBookingPage.sessionBookingDetailsHeading,
      ).toBeVisible();
      await newUiSessionBookingPage.assertSessionBookingDetailsUiElementsVisible();
    });

    await test.step("Open Session Overview and verify panel member and time", async () => {
      const viewSessionOverviewControl = page
        .locator(
          'button:has-text("View Session Overview"), a:has-text("View Session Overview"), [role="button"]:has-text("View Session Overview")',
        )
        .first();

      await expect(viewSessionOverviewControl).toBeVisible();
      await viewSessionOverviewControl.click();

      const sessionOverviewPopup = newUiSessionBookingPage.sessionOverviewPopup;

      await expect(sessionOverviewPopup).toContainText("AMANDA FOSTER");
      await expect(sessionOverviewPopup).toContainText("10:00-11:00");

      const closeButton = newUiSessionBookingPage.closeSessionOverviewButton;

      await expect(closeButton).toBeVisible();
      await closeButton.click();
    });

    await test.step("Validate Date field is not editable in edit mode", async () => {
      await newUiSessionBookingPage.assertDateIsNotEditableInEditMode();
    });

    await test.step("Validate Default Listing Duration is not editable when a listing exists", async () => {
      await newUiSessionBookingPage.assertDefaultListingDurationNotEditableWhenListingExists(
        newUiSessionBookingPage.CONSTANTS.DEFAULT_LISTING_DURATION_ONE_HOUR,
      );
    });

    await fillInternalAndExternalComments(
      newUiSessionBookingPage,
      `EDIT-${newUiSessionBookingPage.CONSTANTS.INTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
      `EDIT-${newUiSessionBookingPage.CONSTANTS.EXTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
    );

    await test.step("Press Save on edited session", async () => {
      await newUiSessionBookingPage.clickSaveSessionBooking();
    });

    await test.step("Wait for Hearing Session page and verify updated internal comment in table", async () => {
      const editedInternalComment = `EDIT-${newUiSessionBookingPage.CONSTANTS.INTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`;
      await expect(hearingSchedulePage.header).toBeVisible();
      await hearingSchedulePage.waitForLoad();
      await expect(hearingSchedulePage.table).toBeVisible();
      await expect(hearingSchedulePage.table).toContainText(
        editedInternalComment,
      );
    });
  });

  test("Create new session, confirm UI validation, and add session break @this", async ({
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
    newUiSessionBookingPage,
  }) => {
    await test.step("Create session without basketed case", async () => {
      await clearDownScheduleFromSessionSummary(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    });

    await newUiSessionBookingPage.createSessionWithoutBasketedCase(
      hearingSchedulePage,
      sessionBookingPage,
      dataUtils,
      newUiSessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
      newUiSessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04,
      0,
      0,
    );

    await newUiSessionBookingPage.assertSessionBookingDetailsUiElementsVisible();
    await assertStartDateFieldPopulated(newUiSessionBookingPage, false);
    await assertStartAndEndTimesPopulated(newUiSessionBookingPage, false);
    await assertLocalityAndLocationPopulated(newUiSessionBookingPage, false);
    await selectDefaultListingDuration(newUiSessionBookingPage);
    await selectSessionType(newUiSessionBookingPage);
    await runSessionBreakFlow(newUiSessionBookingPage);
    await fillInternalAndExternalComments(
      newUiSessionBookingPage,
      `${newUiSessionBookingPage.CONSTANTS.INTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
      `${newUiSessionBookingPage.CONSTANTS.EXTERNAL_COMMENT_PREFIX}${process.env.CASE_NAME as string}`,
    );

    await saveSessionAndSelectHearingType(newUiSessionBookingPage);
  });
});

async function runSessionBreakFlow(
  newUiSessionBookingPage: NewUiSessionBookingPage,
): Promise<void> {
  await test.step("Assert Breaks section and Add Break button are visible", async () => {
    await expect(newUiSessionBookingPage.breaksLabel).toBeVisible();
    await expect(newUiSessionBookingPage.addBreakButton).toBeVisible();
  });

  await test.step("Add first break 12:00 to 13:00", async () => {
    await newUiSessionBookingPage.addBreakButton.click();
    await newUiSessionBookingPage.setBreakTimes("12:00", "13:00");
    await newUiSessionBookingPage.confirmBreakModal();
  });

  await test.step("Assert Session Booking page reloaded and breaks table is visible", async () => {
    await expect(
      newUiSessionBookingPage.sessionBookingDetailsHeading,
    ).toBeVisible();
    await expect(
      newUiSessionBookingPage.breaksStartTimeHeader.first(),
    ).toBeVisible();
    await expect(
      newUiSessionBookingPage.breaksEndTimeHeader.first(),
    ).toBeVisible();
  });

  await test.step("Verify break row with Start Time 12:00 and End Time 13:00 appears in breaks table", async () => {
    const breakRow = newUiSessionBookingPage.getBreakRowByStartTime("12:00");
    await expect(breakRow).toBeVisible();
    await expect(breakRow).toContainText("13:00");
  });

  await test.step("Add second break 14:00 to 15:00", async () => {
    await newUiSessionBookingPage.addBreakButton.click();
    await newUiSessionBookingPage.setBreakTimes("14:00", "15:00");
    await newUiSessionBookingPage.confirmBreakModal();
    await expect(
      newUiSessionBookingPage.getBreakRow("14:00", "15:00"),
    ).toBeVisible();
  });

  await test.step("Edit second break and assert modal is pre-populated", async () => {
    await newUiSessionBookingPage.clickEditBreak("14:00", "15:00");
    await newUiSessionBookingPage.assertBreakModalPrePopulated(
      "14:00",
      "15:00",
    );
  });

  await test.step("Update edited break to 11:00 to 12:00 and confirm", async () => {
    await newUiSessionBookingPage.setBreakTimes("11:00", "12:00");
    await newUiSessionBookingPage.confirmBreakModal();
  });

  await test.step("Assert edited break is updated and old row is no longer shown", async () => {
    await expect(
      newUiSessionBookingPage.getBreakRow("11:00", "12:00"),
    ).toBeVisible();
    await expect(
      newUiSessionBookingPage.getBreakRow("14:00", "15:00"),
    ).not.toBeVisible();
  });

  await test.step("Assert breaks table remains sorted by start time", async () => {
    await newUiSessionBookingPage.assertBreakStartTimesSortedAscending();
  });
}

async function assertStartDateFieldPopulated(
  newUiSessionBookingPage: NewUiSessionBookingPage,
  basketedCase: boolean,
): Promise<void> {
  if (!basketedCase) {
    await test.step("Assert start date is present, then update to next valid day and revert to today", async () => {
      await expect(
        newUiSessionBookingPage.editableStartTimeInput,
      ).toBeVisible();
      await expect(newUiSessionBookingPage.editableStartTimeInput).toHaveValue(
        /\d{2}-\d{2}-\d{4}/,
      );

      const today = new Date();
      const nextOffset = today.getDay() === 5 ? 2 : 1;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + nextOffset);

      const nextDateValue = formatDateForStartDateInput(nextDate);
      await newUiSessionBookingPage.setStartDate(nextDateValue);
      await newUiSessionBookingPage.assertStartDateValue(nextDateValue);

      const todayValue = formatDateForStartDateInput(today);
      await newUiSessionBookingPage.setStartDate(todayValue);
      await newUiSessionBookingPage.assertStartDateValue(todayValue);
    });

    return;
  }

  await test.step("Assert start date field is present and populated", async () => {
    await expect(newUiSessionBookingPage.editableStartTimeInput).toBeVisible();
    await expect(newUiSessionBookingPage.editableStartTimeInput).toHaveValue(
      /\d{2}-\d{2}-\d{4}/,
    );
  });
}

async function assertLocalityAndLocationPopulated(
  newUiSessionBookingPage: NewUiSessionBookingPage,
  basketedCase: boolean,
): Promise<void> {
  if (basketedCase) {
    await test.step("Assert locality and location are already populated", async () => {
      await newUiSessionBookingPage.assertLocality(
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
      );
      await newUiSessionBookingPage.assertLocation(
        newUiSessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_01,
      );
    });
    return;
  }

  await test.step("Update locality to Cardiff and location to Cardiff Courtroom 02 and confirm", async () => {
    await newUiSessionBookingPage.setLocality(
      newUiSessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARDIFF_CC_FC,
    );
    await newUiSessionBookingPage.setLocation(
      newUiSessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARDIFF_CRTRM_02,
    );
    await newUiSessionBookingPage.assertLocality(
      newUiSessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARDIFF_CC_FC,
    );
    await newUiSessionBookingPage.assertLocation(
      newUiSessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARDIFF_CRTRM_02,
    );
  });

  await test.step("Revert locality to Haverfordwest and location to Haverfordwest Courtroom 04 and confirm", async () => {
    await newUiSessionBookingPage.setLocality(
      newUiSessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
    );
    await newUiSessionBookingPage.setLocation(
      newUiSessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04,
    );
    await newUiSessionBookingPage.assertLocality(
      newUiSessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_HAVERFORDWEST_CC_FC,
    );
    await newUiSessionBookingPage.assertLocation(
      newUiSessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_HAVERFORDWEST_CRTRM_04,
    );
  });
}

async function assertStartAndEndTimesPopulated(
  newUiSessionBookingPage: NewUiSessionBookingPage,
  basketedCase: boolean,
): Promise<void> {
  if (basketedCase) {
    await test.step("Assert start and end times are already populated", async () => {
      await newUiSessionBookingPage.assertStartTime("10:00");
      await newUiSessionBookingPage.assertEndTime("16:00");
    });
    return;
  }

  await test.step("Update start time to 11:00 and end time to 17:00 and confirm", async () => {
    await newUiSessionBookingPage.assertStartTime("10:00");
    await newUiSessionBookingPage.assertEndTime("16:00");
    await newUiSessionBookingPage.setStartTime("11:00");
    await newUiSessionBookingPage.setEndTime("17:00");
    await newUiSessionBookingPage.assertStartTime("11:00");
    await newUiSessionBookingPage.assertEndTime("17:00");
  });

  await test.step("Revert start time to 10:00 and end time to 16:00 and confirm", async () => {
    await newUiSessionBookingPage.setStartTime("10:00");
    await newUiSessionBookingPage.setEndTime("16:00");
    await newUiSessionBookingPage.assertStartTime("10:00");
    await newUiSessionBookingPage.assertEndTime("16:00");
  });
}

async function selectSessionType(
  newUiSessionBookingPage: NewUiSessionBookingPage,
): Promise<void> {
  await test.step("Select session type as Adhoc (as directed) and confirm selection", async () => {
    await newUiSessionBookingPage.selectAndAssertSessionType(
      newUiSessionBookingPage.CONSTANTS.SESSION_TYPE_ADHOC_AS_DIRECTED,
    );
  });
}

async function selectDefaultListingDuration(
  newUiSessionBookingPage: NewUiSessionBookingPage,
): Promise<void> {
  await test.step("Select default listing duration as 01:00 and confirm selection", async () => {
    await newUiSessionBookingPage.selectAndAssertDefaultListingDuration(
      newUiSessionBookingPage.CONSTANTS.DEFAULT_LISTING_DURATION_ONE_HOUR,
    );
  });
}

async function assertSessionStatusPopulated(
  newUiSessionBookingPage: NewUiSessionBookingPage,
): Promise<void> {
  await test.step("Assert session status is already populated", async () => {
    await newUiSessionBookingPage.assertSessionStatus(
      newUiSessionBookingPage.CONSTANTS.SESSION_STATUS_RELEASED,
    );
  });
}

async function addPanelMemberAndSelectHearingType(
  newUiSessionBookingPage: NewUiSessionBookingPage,
  panelMember: string,
): Promise<void> {
  await test.step("Click Add Panel Members button", async () => {
    await newUiSessionBookingPage.clickAddPanelMember();
  });

  await test.step("Search for panel member", async () => {
    await newUiSessionBookingPage.searchPanelMember(panelMember);
  });

  await test.step("Click Select & Save for the first panel member result", async () => {
    await newUiSessionBookingPage.clickSelectAndSaveFirstPanelMember();
  });

  await test.step("Dismiss no specialism confirmation popup if present", async () => {
    await newUiSessionBookingPage.dismissNoSpecialismConfirmationIfPresent();
  });
}

async function saveSessionAndSelectHearingType(
  newUiSessionBookingPage: NewUiSessionBookingPage,
): Promise<void> {
  await test.step("Click Save Session Booking button", async () => {
    await newUiSessionBookingPage.clickSaveSessionBooking();
  });

  await test.step("Select hearing type as Chambers Outcome in listing popup, and Save", async () => {
    await newUiSessionBookingPage.selectHearingTypeInListingPopup(
      newUiSessionBookingPage.CONSTANTS.HEARING_TYPE_CHAMBERS_OUTCOME,
    );
  });
}

function formatDateForStartDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}

async function fillInternalAndExternalComments(
  newUiSessionBookingPage: NewUiSessionBookingPage,
  internalComment: string,
  externalComment: string,
): Promise<void> {
  await test.step("Fill internal comment", async () => {
    await newUiSessionBookingPage.fillInternalComment(internalComment);
  });

  await test.step("Fill external comment", async () => {
    await newUiSessionBookingPage.fillExternalComment(externalComment);
  });
}
