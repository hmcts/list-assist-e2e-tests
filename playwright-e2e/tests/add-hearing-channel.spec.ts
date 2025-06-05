import { expect, test } from '../fixtures';
import { HomePage, CaseSearchPage, CaseDetailsPage, HearingSchedulePage } from '../page-objects/pages';
import { SessionBookingPage } from '../page-objects/pages/hearings/session-booking.po';
import { config } from '../utils';
import fs from 'fs/promises';
import path from 'path';

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe('Hearing channel test @hearing-channel', () => {
  let hearingChannelHmctsCaseNumber: string;
  let hearingChannelCaseName: string;

  test.beforeAll(async () => {
    //grabs case names and numbers from case-references.json
    const userJsonPath = path.resolve(
      path.dirname(new URL('', import.meta.url).pathname),
      '../data/case-references.json',
    );
    const userJson = JSON.parse(await fs.readFile(userJsonPath, 'utf-8'));
    hearingChannelHmctsCaseNumber = userJson.HEARING_CHANNEL_HMCTS_CASE_NUMBER;
    hearingChannelCaseName = userJson.HEARING_CHANNEL_CASE_NAME;
  });

  test.beforeEach(async ({ page, hearingSchedulePage, sessionBookingPage }) => {
    await page.goto(config.urls.baseUrl);
    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    //clears sessions at start of test class but then does not when sessions created as part of tests in the class
    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_LEICESTER_CC_7,
    );
  });

  test('Only the session-supported hearing channels should be displayed', async ({
    editNewCasePage,
    caseDetailsPage,
    addNewCasePage,
    listingRequirementsPage,
    homePage,
    caseSearchPage,
    hearingSchedulePage,
    sessionBookingPage,
  }) => {
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_LEICESTER_CC_7,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: hearingChannelHmctsCaseNumber,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

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
          timeout: 20_000,
        },
      )
      .toBeTruthy();
    await expect(caseDetailsPage.listingRequirementsHeader).toBeVisible();

    //select hearing type
    await caseDetailsPage.hearingTypeSelect.selectOption(addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF);

    //select hearing channel
    await listingRequirementsPage.parentHearingChannel.click();
    await listingRequirementsPage.setHearingChannel(listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_IN_PERSON);
    await listingRequirementsPage.setHearingChannel(listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_TELEPHONE);
    await caseDetailsPage.saveButton.click();

    await createHearingSession(
      hearingChannelCaseName,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      roomData,
      sessionBookingPage,
    );
  });
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
  await homePage.upperbarComponent.currentCaseDropdownButton.click();
  await expect(homePage.upperbarComponent.currentCaseDropdownList).toContainText(
    homePage.upperbarComponent.currentCaseDropDownItems,
  );

  //add case to cart.
  await caseSearchPage.sidebarComponent.openSearchCasePage();
  await caseSearchPage.searchCase(caseName);

  await caseDetailsPage.addToCartButton.click();
  await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

  //go to hearing schedule page
  await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();

  //schedule hearing
  await hearingSchedulePage.waitForLoad();

  await hearingSchedulePage.scheduleHearingWithBasket(roomData.roomName, roomData.column, roomData.caseNumber);

  //session booking page
  await sessionBookingPage.bookSession(
    sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
    sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
  );

  await hearingSchedulePage.waitForLoad();

  await sessionBookingPage.expandRoomButton();

  // asserting that only phone icon is displayed
  const allIcons = await sessionBookingPage.allIcons.count();
  const interpreterIcons = await sessionBookingPage.interpreterLanguageIcon.count();
  const phoneIcons = await sessionBookingPage.phoneIcons.count();

  expect(phoneIcons).toBe(1);

  if (interpreterIcons === 1) {
    expect(allIcons).toBe(2);
  } else {
    expect(interpreterIcons).toBe(0);
    expect(allIcons).toBe(1);
  }
}
