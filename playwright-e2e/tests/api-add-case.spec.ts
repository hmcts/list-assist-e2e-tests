import { test } from "../fixtures.js";
import { HmiUtils } from "../utils/hmi.utils.js";
import { expect } from "@playwright/test";

test.describe("Add case via API @add-case-and-create-listing-smoke-test", () => {
  test("Add case via API", async ({
    addNewCasePage,
    page,
    loginPage,
    config,
    caseSearchPage,
    dataUtils,
    editNewCasePage,
    hearingSchedulePage,
    sessionBookingPage,
    caseDetailsPage,
  }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser);

    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    await sessionBookingPage.updateAdvancedFilterConfig(
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    );

    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );

    // Generate case details
    const HMCTS_CASE_NUMBER = "HMCTS_CN_" + crypto.randomUUID().toUpperCase();
    const CASE_NAME = "AUTO_" + crypto.randomUUID().toUpperCase();

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
      `Acme Vs ${dataUtils.generateRandomAlphabetical(10).toUpperCase()}`;

    console.log(JSON.stringify(payload, null, 2));
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
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: HMCTS_CASE_NUMBER as string,
    };

    //add listing
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
  });
});
