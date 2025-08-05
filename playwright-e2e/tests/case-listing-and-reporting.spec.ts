import { expect, test } from "../fixtures";
import { HmiUtils } from "../utils/hmi.utils.js";
import {
  CaseDetailsPage,
  CaseSearchPage,
  HearingSchedulePage,
  HomePage,
} from "../page-objects/pages";
import { SessionBookingPage } from "../page-objects/pages/hearings/session-booking.po";
import { config } from "../utils";

test.describe("Case listing and reporting @case-listing-and-reporting", () => {
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

  test('List "Released" session and Generate report via reports menu', async ({
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
  }) => {
    await openHearingSchedulePageWithStep(sessionBookingPage);
    await updateAdvancedFilterConfigWithStep(
      sessionBookingPage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    );
    await clearDownScheduleWithStep(
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );

    const roomData = {
      roomName:
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
      sessionDuration:
        sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType:
        sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason:
        sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await test.step("Create hearing session", async () => {
      await createHearingSession(
        roomData.caseNumber,
        homePage,
        caseSearchPage,
        caseDetailsPage,
        hearingSchedulePage,
        roomData,
        sessionBookingPage,
      );
    });

    const reportData = {
      dateFrom: dataUtils.generateDateInYyyyMmDdNoSeparators(0),
      dateTo: dataUtils.generateDateInYyyyMmDdNoSeparators(1),
      locality:
        viewReportsPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      location:
        viewReportsPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      jurisdiction: viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
      service: viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
    };

    await test.step("Open reports menu and check generated report", async () => {
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
  });

  test('List "Released" session and Generate report via P&I Dashboard. Run and confirm scheduled job is completed @pr-test', async ({
    addNewCasePage,
    editNewCasePage,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    automaticBookingDashboardPage,
    dataUtils,
  }) => {
    const HMCTS_CASE_NUMBER = "HMCTS_CN_" + crypto.randomUUID().toUpperCase();
    const CASE_NAME = "AUTO_" + crypto.randomUUID().toUpperCase();

    await openHearingSchedulePageWithStep(sessionBookingPage);
    await updateAdvancedFilterConfigWithStep(
      sessionBookingPage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );
    await clearDownScheduleWithStep(
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );

    await test.step("Run scheduled jobs to clear queue", async () => {
      await automaticBookingDashboardPage.sidebarComponent.openScheduledJobsPage();
      await automaticBookingDashboardPage.clickRunForAutomaticBookingQueueJob(
        automaticBookingDashboardPage.CONSTANTS
          .SCHEDULE_JOBS_AUTOMATIC_BOOKING_QUEUE_JOB,
      );
      await automaticBookingDashboardPage.sidebarComponent.scheduledJobsHeader.isVisible();
    });

    let caseData;
    let payload;
    await test.step("Prepare case data and payload", async () => {
      caseData = {
        hmctsCaseNumberHeaderValue:
          addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
        caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
        listingType: addNewCasePage.CONSTANTS.LISTING_TYPE_DAMAGES,
        jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL_REFERENCE,
        service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES_REFERENCE,
        caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS_REFERENCE,
        region: addNewCasePage.CONSTANTS.REGION_WALES,
        locationId: addNewCasePage.CONSTANTS.LOCATION_ID_CARDIFF_CCJGC,
        cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
        hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
        currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
      };

      payload = config.data.addCase;
      payload["hearingRequest"]["_case"]["caseListingRequestId"] =
        HMCTS_CASE_NUMBER;
      payload["hearingRequest"]["_case"]["caseIdHMCTS"] = HMCTS_CASE_NUMBER;
      payload["hearingRequest"]["_case"]["caseTitle"] = CASE_NAME;
      payload["hearingRequest"]["_case"]["caseRegistered"] =
        dataUtils.getCurrentDateTimeUTC();
      payload["hearingRequest"]["_case"]["caseCourt"]["locationId"] =
        caseData.locationId;
      payload["hearingRequest"]["listing"]["listingType"] =
        caseData.listingType;
      payload["hearingRequest"]["listing"]["listingLocations"]["locationId"] =
        caseData.locationId;
      payload["hearingRequest"]["listing"]["listingLocations"][
        "locationReferenceType"
      ] = addNewCasePage.CONSTANTS.LOCATION_TYPE_REFERENCE_EPIMS;
      payload["hearingRequest"]["listing"]["listingDate"] =
        dataUtils.getCurrentDateTimeUTC();
      payload["hearingRequest"]["entities"][0]["entityId"] =
        crypto.randomUUID();
      payload["hearingRequest"]["entities"][0]["entityTypeCode"] =
        addNewCasePage.CONSTANTS.ENTITY_TYPE_CODE_IND;
      payload["hearingRequest"]["entities"][0]["entityRoleCode"] =
        addNewCasePage.CONSTANTS.ENTITY_ROLE_CODE_CLAI;
      payload["hearingRequest"]["entities"][1]["entityId"] =
        crypto.randomUUID();
      payload["hearingRequest"]["entities"][1]["entityTypeCode"] =
        addNewCasePage.CONSTANTS.ENTITY_TYPE_CODE_ORG;
      payload["hearingRequest"]["entities"][1]["entityRoleCode"] =
        addNewCasePage.CONSTANTS.ENTITY_ROLE_CODE_DEFE;
      payload["hearingRequest"]["entities"][1]["entitySubType"][
        "entityClassCode"
      ] = addNewCasePage.CONSTANTS.ENTITY_TYPE_CODE_ORG;
      payload["hearingRequest"]["entities"][1]["entitySubType"][
        "entityCompanyName"
      ] = "Acme Corporation";
      payload["hearingRequest"]["_case"]["caseJurisdiction"] =
        caseData.jurisdiction;
      payload["hearingRequest"]["_case"]["caseClassifications"][
        "caseClassificationService"
      ] = caseData.service;
      payload["hearingRequest"]["_case"]["caseClassifications"][
        "caseClassificationType"
      ] = caseData.caseType;
      payload["hearingRequest"]["_case"]["caseClassifications"][
        "caseClassificationSubType"
      ] = caseData.caseType;
      payload["hearingRequest"]["_case"]["casePublishedName"] =
        `Acme Vs ${dataUtils.generateRandomAlphabetical(10).toUpperCase()}`;
    });

    await test.step("Request hearing via HMI", async () => {
      await HmiUtils.requestHearing(payload);
    });

    await test.step("Run job to pull through created case", async () => {
      await addNewCasePage.sidebarComponent.openScheduledJobsPage();
      await addNewCasePage.sidebarComponent.hmiCreateMatterFromXMLJobButton.click();
      await expect(
        addNewCasePage.sidebarComponent.scheduledJobsHeader,
      ).toBeVisible();
    });

    await test.step("Search for the case and verify", async () => {
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(HMCTS_CASE_NUMBER);
      await expect(editNewCasePage.caseNameField).toHaveText(CASE_NAME);
    });

    const roomData = {
      roomName:
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: HMCTS_CASE_NUMBER as string,
      sessionDuration:
        sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType:
        sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason:
        sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await test.step("Create hearing session", async () => {
      await createHearingSession(
        roomData.caseNumber,
        homePage,
        caseSearchPage,
        caseDetailsPage,
        hearingSchedulePage,
        roomData,
        sessionBookingPage,
      );
    });

    await test.step("Open Automatic Booking Dashboard and create publish external list", async () => {
      await homePage.sidebarComponent.openAutomaticBookingDashboard();
      await automaticBookingDashboardPage.createPublishExternalListsHeader.isVisible();
      await automaticBookingDashboardPage.publishExternalListsCreate.click();
      await automaticBookingDashboardPage.populateCreatePublishExternalListsForm(
        automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_REGION_WALES,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_JURISDICTION_CIVIL,
        automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_SERVICE_DAMAGES,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_DAILY_MIXED_CAUSE_LIST_SSRS,
        automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_VERSION_TYPE,
      );
    });

    await test.step("Assert report preview is generated", async () => {
      await automaticBookingDashboardPage.assertPreviewReport(
        dataUtils.getFormattedDateForReportAssertion(),
        automaticBookingDashboardPage.CONSTANTS
          .CIVIL_AND_FAMILY_DAILY_CAUSE_LIST,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
      );
    });

    let jobRun = "false";

    await test.step("Publish report and check it is queued", async () => {
      await expect(automaticBookingDashboardPage.publishButton).toBeVisible();
      await automaticBookingDashboardPage.publishButton.click();
      await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
      await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
        jobRun,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
      );
      await automaticBookingDashboardPage.closePublishExternalListButton.click();
    });

    await test.step("Run scheduled jobs to process report", async () => {
      await automaticBookingDashboardPage.sidebarComponent.openScheduledJobsPage();
      await automaticBookingDashboardPage.clickRunForAutomaticBookingQueueJob(
        automaticBookingDashboardPage.CONSTANTS
          .SCHEDULE_JOBS_AUTOMATIC_BOOKING_QUEUE_JOB,
      );
      jobRun = "true";
      await automaticBookingDashboardPage.sidebarComponent.scheduledJobsHeader.isVisible();
    });

    await test.step("Check report has been removed from queue", async () => {
      await automaticBookingDashboardPage.sidebarComponent.openAutomaticBookingDashboard();
      await automaticBookingDashboardPage.publishExternalListsView.click();
      await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
      await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
        jobRun,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
      );
    });
  });

  test("Multi-day case listing and reporting", async ({
    addNewCasePage,
    caseSearchPage,
    editNewCasePage,
    caseDetailsPage,
    listingRequirementsPage,
    sessionBookingPage,
    hearingSchedulePage,
    multiDayCartPage,
    dataUtils,
  }) => {
    const caseData = {
      hmctsCaseNumberHeaderValue:
        addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
      caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
      jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
      service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
      caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
      region: addNewCasePage.CONSTANTS.REGION_WALES,
      cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
      hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
      currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
    };

    await openHearingSchedulePageWithStep(sessionBookingPage);
    await updateAdvancedFilterConfigWithStep(
      sessionBookingPage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_ABERYSTWYTH_JC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
    );
    await clearDownMultiDayScheduleWithStep(
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );

    await test.step("Search for case and add to cart", async () => {
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
      await caseSearchPage.addToCartButton.click();
    });

    await test.step("Open listing requirements and set up", async () => {
      await editNewCasePage.sidebarComponent.openListingRequirementsPage();
      await expect
        .poll(
          async () => {
            return await caseDetailsPage.listingRequirementsHeader.isVisible();
          },
          {
            intervals: [2_000],
            timeout: 60_000,
          },
        )
        .toBeTruthy();
      await expect(caseDetailsPage.listingRequirementsHeader).toBeVisible();
      await caseDetailsPage.hearingTypeSelect.selectOption(
        caseData.hearingTypeRef,
      );
      await listingRequirementsPage.multidayHearingDaysTextBox.fill("3");
      await caseDetailsPage.saveButton.click();
    });

    await openHearingSchedulePageWithStep(sessionBookingPage);

    await updateAdvancedFilterConfigWithStep(
      sessionBookingPage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_ABERYSTWYTH_JC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
      "Update advanced filter config for unique location/locality",
    );

    await test.step("Create multi-day session", async () => {
      await hearingSchedulePage.addBookingButton.click();
      await hearingSchedulePage.createSessionButton.click();
      await expect(hearingSchedulePage.recurranceCheckbox).toBeVisible();
      await hearingSchedulePage.recurranceCheckbox.check();
      await checkWeekdayRecurringCheckboxes(hearingSchedulePage.page);
      await hearingSchedulePage.recurranceWeeksTextbox.fill("1");
      await hearingSchedulePage.recurranceDateUntilTextBox.fill(
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(7),
      );
      await sessionBookingPage.durationDropdownButton.click();
      await sessionBookingPage.selectListingDuration(
        sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      );
      await hearingSchedulePage.saveButton.click();
      await hearingSchedulePage.waitForLoad();
    });

    await confirmSessionsCreatedWithStep(hearingSchedulePage);

    await test.step("Cart all sessions", async () => {
      const cartAllSessionsButton = hearingSchedulePage.page.locator(
        `button[title="Cart all sessions of room: ${sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1}"][aria-label="Cart all sessions of room: ${sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1}"]`,
      );
      await expect(cartAllSessionsButton).toBeVisible();
      await cartAllSessionsButton.click();
    });

    await test.step("Check multi-day cart is populated", async () => {
      await hearingSchedulePage.sidebarComponent.checkMultiDayCartButtonEnabled();
      await hearingSchedulePage.sidebarComponent.checkMultiDayCartNumberIsPresent();
    });

    await test.step("Open multi-day cart and assert table", async () => {
      await hearingSchedulePage.sidebarComponent.openMultiDayCart();
      await multiDayCartPage.assertMultiDaysCartPageHasLoaded();
      await multiDayCartPage.assertAllLinesInMultiDaysCartTableHaveCorrectLocalityAndLocation(
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_ABERYSTWYTH_JC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
      );
    });

    await test.step("Select case from dropdown and apply filter", async () => {
      await multiDayCartPage.selectCaseFromSelectDropDown(
        process.env.HMCTS_CASE_NUMBER as string,
      );
      const lrString =
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0) + " Open";
      await multiDayCartPage.waitForlistingRequirementsSelectionToBePopulated(
        lrString,
      );
      await multiDayCartPage.applyFilterButton.click();
      await multiDayCartPage.bulkListCheckBox.click();
      await multiDayCartPage.submitButton.click();
    });

    await test.step("Handle multi-day validation popup", async () => {
      const pagePromise = multiDayCartPage.page.waitForEvent("popup", {
        timeout: 2000,
      });
      await multiDayCartPage.okbuttonOnValidationPopup.click();
      const validationPopup = await pagePromise;
      await validationPopup.waitForLoadState("domcontentloaded");
      await validationPopup
        .getByRole("combobox", { name: "Reason to override rule/s *" })
        .selectOption({
          label:
            sessionBookingPage.CONSTANTS
              .CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON,
        });
      await validationPopup
        .getByRole("button", { name: "SAVE & CONTINUE LISTING" })
        .click();
    });

    await test.step("Create listings only and wait for load", async () => {
      await multiDayCartPage.additionalListingDataPageHeader.isVisible();
      await multiDayCartPage.createListingsOnlyButton.click();
      await hearingSchedulePage.waitForLoad();
    });

    await confirmSessionsCreatedWithStep(
      hearingSchedulePage,
      1,
      5,
      "Confirm sessions created after listing",
    );
  });

  async function createHearingSession(
    caseName: string,
    homePage: HomePage,
    caseSearchPage: CaseSearchPage,
    caseDetailsPage: CaseDetailsPage,
    hearingSchedulePage: HearingSchedulePage,
    roomData: {
      roomName: string;
      column: string;
      caseNumber: string;
      sessionDuration: string;
      hearingType: string;
      cancelReason: string;
    },
    sessionBookingPage: SessionBookingPage,
  ) {
    // Check if the close case button in upper bar is present
    await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();
    //check current case drop down menu in upper bar
    await expect(
      homePage.upperbarComponent.currentCaseDropdownButton,
    ).toBeVisible();
    await homePage.upperbarComponent.currentCaseDropdownButton.click();

    await expect(
      homePage.upperbarComponent.currentCaseDropdownList,
    ).toContainText(homePage.upperbarComponent.currentCaseDropDownItems);

    //add case to cart
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(caseName);

    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

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
    );

    //confirm listing
    await expect(
      hearingSchedulePage.confirmListingReleasedStatus,
    ).toBeVisible();
  }

  async function checkWeekdayRecurringCheckboxes(page) {
    for (const day of [2, 3, 4, 5, 6]) {
      await page.check(`#venueBooking\\.recurringDay${day}`);
    }
  }
});

// Helper functions
async function openHearingSchedulePageWithStep(sessionBookingPage) {
  await test.step("Open hearing schedule page", async () => {
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();
  });
}

async function updateAdvancedFilterConfigWithStep(
  sessionBookingPage,
  region,
  cluster,
  locality,
  location,
  stepLabel = "Update advanced filter config",
) {
  await test.step(stepLabel, async () => {
    await sessionBookingPage.updateAdvancedFilterConfig(
      region,
      cluster,
      locality,
      location,
    );
  });
}

async function clearDownScheduleWithStep(
  hearingSchedulePage,
  cancelCode,
  location,
  date,
  stepLabel = "Clear down schedule",
) {
  await test.step(stepLabel, async () => {
    await hearingSchedulePage.clearDownSchedule(cancelCode, location, date);
  });
}

async function clearDownMultiDayScheduleWithStep(
  hearingSchedulePage,
  location,
  date,
) {
  await test.step("Clear down multi-day schedule", async () => {
    await hearingSchedulePage.clearDownMultiDaySchedule(location, date);
  });
}

async function confirmSessionsCreatedWithStep(
  hearingSchedulePage,
  min = 1,
  max = 5,
  stepLabel = "Confirm sessions created",
) {
  await test.step(stepLabel, async () => {
    const count =
      await hearingSchedulePage.confirmListingReleasedStatus.count();
    expect(count).toBeGreaterThan(min - 1);
    expect(count).toBeLessThanOrEqual(max);
  });
}
