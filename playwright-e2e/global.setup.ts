import { test as setup } from './fixtures';
import { isSessionValid } from './utils';
import { HmiUtils } from './utils/hmi.utils.js';

setup.describe('Global Setup', () => {
  setup.beforeAll(async ({ dataUtils }) => {
    // Update bank holidays file if needed
    dataUtils.updateBankHolidaysFileIfNeeded();
  });

  setup('Setup test user', async ({ loginPage, page, config }) => {
    // Test user setup
    const user = config.users.testUser;
    if (!isSessionValid(user.sessionFile, user.cookieName!)) {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
    }
  });

  setup('Create new case', async ({ loginPage, config, page, addNewCasePage, hearingSchedulePage, dataUtils }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser);

    // Empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    // Generate case details
    process.env.HMCTS_CASE_NUMBER = 'HMCTS_CN_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();
    process.env.CASE_NAME = 'AUTO_' + dataUtils.generateRandomAlphabetical(10).toUpperCase();

    const caseData = {
      hmctsCaseNumberHeaderValue: addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
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

    const payload = config.data.hearingRequest;
    payload['hearingRequest']['_case']['caseListingRequestId'] = process.env.HMCTS_CASE_NUMBER;
    payload['hearingRequest']['_case']['caseIdHMCTS'] = process.env.HMCTS_CASE_NUMBER;
    payload['hearingRequest']['_case']['caseTitle'] = process.env.CASE_NAME;
    payload['hearingRequest']['_case']['caseRegistered'] = dataUtils.getCurrentDateTimeUTC();
    payload['hearingRequest']['_case']['caseCourt']['locationId'] = caseData.locationId;

    //listing block
    payload['hearingRequest']['listing']['listingType'] = caseData.listingType;
    payload['hearingRequest']['listing']['listingLocations']['locationId'] = caseData.locationId;
    payload['hearingRequest']['listing']['listingLocations']['locationReferenceType'] =
      addNewCasePage.CONSTANTS.LOCATION_TYPE_REFERENCE_EPIMS;

    //entities block
    //claimant
    payload['hearingRequest']['entities'][0]['entityTypeCode'] = addNewCasePage.CONSTANTS.ENTITY_TYPE_CODE_IND;
    payload['hearingRequest']['entities'][0]['entityRoleCode'] = addNewCasePage.CONSTANTS.ENTITY_ROLE_CODE_CLAI;
    //defendant
    payload['hearingRequest']['entities'][1]['entityTypeCode'] = addNewCasePage.CONSTANTS.ENTITY_TYPE_CODE_ORG;
    payload['hearingRequest']['entities'][1]['entityRoleCode'] = addNewCasePage.CONSTANTS.ENTITY_ROLE_CODE_DEFE;
    payload['hearingRequest']['entities'][1]['entitySubType']['entityClassCode'] =
      addNewCasePage.CONSTANTS.ENTITY_TYPE_CODE_ORG;
    payload['hearingRequest']['entities'][1]['entitySubType']['entityCompanyName'] = 'Acme Corporation';

    //_case block
    payload['hearingRequest']['_case']['caseJurisdiction'] = caseData.jurisdiction;
    payload['hearingRequest']['_case']['caseClassifications']['caseClassificationService'] = caseData.service;
    payload['hearingRequest']['_case']['caseClassifications']['caseClassificationType'] = caseData.caseType;
    payload['hearingRequest']['_case']['caseClassifications']['caseClassificationSubType'] = caseData.caseType;

    //misc
    payload['hearingRequest']['_case']['casePublishedName'] =
      `Acme Vs ${dataUtils.generateRandomAlphabetical(10).toUpperCase()}`;

    console.log(payload);
    await HmiUtils.requestHearing(payload);
  });
});
