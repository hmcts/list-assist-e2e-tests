import { expect, test } from "../../fixtures.js";
import { HmiUtils } from "../../utils/hmi.utils.js";
import {
  CaseDetailsPage,
  CaseSearchPage,
  HearingSchedulePage,
  HomePage,
} from "../../page-objects/pages/index.js";
import { SessionBookingPage } from "../../page-objects/pages/hearings/session-booking.po.js";
import { config } from "../../utils/index.js";
import { clearDownSchedule } from "../../utils/reporting.utils.js";

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
      sessionBookingPage,
      dataUtils,
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

      await clearDownWalesSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        dataUtils,
      );
    },
  );

  test.afterEach(
    async ({ page, sessionBookingPage, hearingSchedulePage, dataUtils }) => {
      await page.goto(config.urls.baseUrl);

      await clearDownWalesSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        dataUtils,
      );
    },
  );

  test('List "Released" session and Generate report via P&I Dashboard. Generate Daily Type Cause List, NEWPORT_SOUTH_WALES_CC_FC(Saesneg) Report. Check CATH report details @pr-build', async ({
    addNewCasePage,
    editNewCasePage,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    automaticBookingDashboardPage,
    dataUtils,
    cath,
  }) => {
    // Generate case details
    const HMCTS_CASE_NUMBER = "HMCTS_CN_" + crypto.randomUUID().toUpperCase();
    const CASE_NAME = "AUTO_" + crypto.randomUUID().toUpperCase();
    const CASE_VS_REFERENCE =
      "Acme Vs " + dataUtils.generateRandomAlphabetical(10).toUpperCase();

    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
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

    const caseData = {
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

    const payload = config.data.addCase;
    payload["hearingRequest"]["_case"]["caseListingRequestId"] =
      HMCTS_CASE_NUMBER;
    payload["hearingRequest"]["_case"]["caseIdHMCTS"] = HMCTS_CASE_NUMBER;
    payload["hearingRequest"]["_case"]["caseTitle"] = CASE_NAME;
    payload["hearingRequest"]["_case"]["caseRegistered"] =
      dataUtils.getCurrentDateTimeUTC();
    payload["hearingRequest"]["_case"]["caseCourt"]["locationId"] =
      caseData.locationId;

    //listing block
    payload["hearingRequest"]["listing"]["listingType"] = caseData.listingType;
    payload["hearingRequest"]["listing"]["listingLocations"]["locationId"] =
      caseData.locationId;
    payload["hearingRequest"]["listing"]["listingLocations"][
      "locationReferenceType"
    ] = addNewCasePage.CONSTANTS.LOCATION_TYPE_REFERENCE_EPIMS;
    payload["hearingRequest"]["listing"]["listingDate"] =
      dataUtils.getCurrentDateTimeUTC();

    //entities block
    //claimant
    payload["hearingRequest"]["entities"][0]["entityId"] = crypto.randomUUID();
    payload["hearingRequest"]["entities"][0]["entityTypeCode"] =
      addNewCasePage.CONSTANTS.ENTITY_TYPE_CODE_IND;
    payload["hearingRequest"]["entities"][0]["entityRoleCode"] =
      addNewCasePage.CONSTANTS.ENTITY_ROLE_CODE_CLAI;
    //defendant
    payload["hearingRequest"]["entities"][1]["entityId"] = crypto.randomUUID();
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

    //_case block
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

    //misc
    payload["hearingRequest"]["_case"]["casePublishedName"] =
      `${CASE_VS_REFERENCE}`;

    await HmiUtils.requestHearing(payload);

    //run the job to pull through created case
    await addNewCasePage.sidebarComponent.openScheduledJobsPage();
    await addNewCasePage.sidebarComponent.hmiCreateMatterFromXMLJobButton.click();
    await expect(
      addNewCasePage.sidebarComponent.scheduledJobsHeader,
    ).toBeVisible();

    //search for the case
    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(HMCTS_CASE_NUMBER);
    await expect(editNewCasePage.caseNameField).toHaveText(CASE_NAME);

    // Test data
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

    await createHearingSession(
      roomData.caseNumber,
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
      automaticBookingDashboardPage.CONSTANTS
        .AUTO_CREATION_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      automaticBookingDashboardPage.CONSTANTS
        .AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_JURISDICTION_CIVIL,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_SERVICE_DAMAGES,
      automaticBookingDashboardPage.CONSTANTS
        .AUTO_CREATION_DAILY_MIXED_CAUSE_LIST_SSRS,
      automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_VERSION_TYPE,
    );

    //assert that the report preview is generated and contains expected elements
    await automaticBookingDashboardPage.assertPreviewReport(
      dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName(),
      automaticBookingDashboardPage.CONSTANTS.CIVIL_AND_FAMILY_DAILY_CAUSE_LIST,
      automaticBookingDashboardPage.CONSTANTS
        .AUTO_CREATION_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1,
    );

    let jobRun = "false";

    //assert publish button is now visible
    await expect(automaticBookingDashboardPage.publishButton).toBeVisible();
    //click publish button
    await automaticBookingDashboardPage.publishButton.click();
    //wait for 'Previous Publish External List header' to be visible
    await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
    //checks that report is queued
    await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
      jobRun,
      automaticBookingDashboardPage.CONSTANTS
        .AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
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
      automaticBookingDashboardPage.CONSTANTS
        .SCHEDULE_JOBS_AUTOMATIC_BOOKING_QUEUE_JOB,
    );
    jobRun = "true";

    //check the header is present after page has refreshed
    await automaticBookingDashboardPage.sidebarComponent.scheduledJobsHeader.isVisible();

    //checks that report has now been removed from queue
    await automaticBookingDashboardPage.sidebarComponent.openAutomaticBookingDashboard();
    await automaticBookingDashboardPage.publishExternalListsView.click();
    //wait for 'Previous Publish External List header' to be visible
    await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
    await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
      jobRun,
      automaticBookingDashboardPage.CONSTANTS
        .AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
    );

    const cathUrl = await cath.cathUrlConstruction(
      cath.CONSTANTS.CATH_TEST_URL,
      cath.CONSTANTS.LOCATION_ID_NEWPORT_SOUTH_WALES_CC_FC,
    );

    //check for report via CATH UI
    const reportName = `${cath.CONSTANTS.LIST_JURISDICTION_CIVIL_AND_FAMILY} ${cath.CONSTANTS.LIST_TYPE_DAILY_CAUSE_LIST} ${dataUtils.getFormattedDateInFormatDDMonthYYYY()} - English (Saesneg)`;

    await cath.goToCathUrlAndConfirmReportDisplayed(
      cath.CONSTANTS.LIST_TYPE_DAILY_CAUSE_LIST,
      cathUrl,
      reportName,
      "10am",
      HMCTS_CASE_NUMBER,
      CASE_VS_REFERENCE,
      addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
      "",
      `Trial (${addNewCasePage.CONSTANTS.SERVICE_DAMAGES})`,
      "Telephone - Other, Video - CVP",
      "1 hour",
      "",
      "",
    );
  });

  test.skip("Multi-day case listing and reporting", async ({
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
    // Test data
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

    //will need to use this to clear down the schedule
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_ABERYSTWYTH_JC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
    );

    await hearingSchedulePage.clearDownMultiDaySchedule(
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );

    await addNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await caseSearchPage.addToCartButton.click();

    //LISTING REQUIREMENTS
    await editNewCasePage.sidebarComponent.openListingRequirementsPage();
    //checks header
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

    //select hearing type
    await caseDetailsPage.hearingTypeSelect.selectOption(
      caseData.hearingTypeRef,
    );
    await listingRequirementsPage.multidayHearingDaysTextBox.fill("3");
    await caseDetailsPage.saveButton.click();

    //open hearing schedule page
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    //look for unique location/locality
    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_ABERYSTWYTH_JC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
    );

    await hearingSchedulePage.addBookingButton.click();
    await hearingSchedulePage.createSessionButton.click();

    //checks recurrance checkbox
    await expect(hearingSchedulePage.recurranceCheckbox).toBeVisible();
    await hearingSchedulePage.recurranceCheckbox.check();

    await checkWeekdayRecurringCheckboxes(hearingSchedulePage.page);

    //input recurrance in weeks
    await hearingSchedulePage.recurranceWeeksTextbox.fill("1");

    //input recurrance until date
    await hearingSchedulePage.recurranceDateUntilTextBox.fill(
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(7),
    );
    //inputs duration of session
    await sessionBookingPage.durationDropdownButton.click();
    await sessionBookingPage.selectListingDuration(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
    );
    await hearingSchedulePage.saveButton.click();
    await hearingSchedulePage.waitForLoad();

    //confirms that there are more than 1 and less than or equal to 5 sessions created
    let releaseStatusCount =
      await hearingSchedulePage.confirmListingReleasedStatus.count();
    expect(releaseStatusCount).toBeGreaterThan(1);
    expect(releaseStatusCount).toBeLessThanOrEqual(5);

    //cart all sessions
    const cartAllSessionsButton = hearingSchedulePage.page.locator(
      `button[title="Cart all sessions of room: ${sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1}"][aria-label="Cart all sessions of room: ${sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1}"]`,
    );
    await expect(cartAllSessionsButton).toBeVisible();
    await cartAllSessionsButton.click();

    //check multi-day cart is populated
    await hearingSchedulePage.sidebarComponent.checkMultiDayCartButtonEnabled();
    await hearingSchedulePage.sidebarComponent.checkMultiDayCartNumberIsPresent();

    //checks multi-day cart page is opened
    await hearingSchedulePage.sidebarComponent.openMultiDayCart();
    await multiDayCartPage.assertMultiDaysCartPageHasLoaded();
    await multiDayCartPage.assertAllLinesInMultiDaysCartTableHaveCorrectLocalityAndLocation(
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_ABERYSTWYTH_JC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_ABERYSTWYTH_CRTRM_1,
    );

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

    //click ok on multi-day validation popup
    const pagePromise = multiDayCartPage.page.waitForEvent("popup", {
      timeout: 2000,
    });
    await multiDayCartPage.okbuttonOnValidationPopup.click();

    //listing validation popup
    const validationPopup = await pagePromise;
    await validationPopup.waitForLoadState("domcontentloaded");
    // interacting with validation popup
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

    await multiDayCartPage.additionalListingDataPageHeader.isVisible();
    await multiDayCartPage.createListingsOnlyButton.click();

    await hearingSchedulePage.waitForLoad();

    //confirms that there are more than 1 and less than or equal to 5 sessions created
    releaseStatusCount =
      await hearingSchedulePage.confirmListingReleasedStatus.count();
    expect(releaseStatusCount).toBeGreaterThan(1);
    expect(releaseStatusCount).toBeLessThanOrEqual(5);
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
      johName?: string;
      jurisdiction?: string;
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

    const items =
      await homePage.upperbarComponent.currentCaseDropdownList.allTextContents();
    const trimmedItems = items.map((text) => text.trim());
    expect(trimmedItems).toEqual(
      homePage.upperbarComponent.currentCaseDropDownItems,
    );

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
      sessionBookingPage.CONSTANTS.AUTO_JUDICIAL_OFFICE_HOLDER_AUTOMATION_JOH,
      undefined,
      undefined,
      `Automation internal comments ${process.env.HMCTS_CASE_NUMBER}`,
      `Automation external comments ${process.env.HMCTS_CASE_NUMBER}`,
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

async function clearDownWalesSchedule(
  sessionBookingPage,
  hearingSchedulePage,
  dataUtils,
) {
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
}
