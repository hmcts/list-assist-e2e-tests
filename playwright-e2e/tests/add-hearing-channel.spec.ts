import { expect, test } from '../fixtures';
import { HomePage, CaseSearchPage, CaseDetailsPage, HearingSchedulePage} from '../page-objects/pages';
import { SessionBookingPage } from '../page-objects/pages/hearings/session-booking.po';
import { config } from '../utils';

test.use({
  storageState: config.users.testUser.sessionFile,
});

let caseCreated = false;
let hmctsCaseNumber: string;
let caseName: string;

test.describe('Hearing channel test @hearing-channel-test', () => {
  test.beforeEach(async ({page, homePage, hearingSchedulePage, sessionBookingPage, addNewCasePage}) => {
    await page.goto(config.urls.baseUrl);
    //empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    //clears sessions at start of test class but then does not when sessions created as part of tests in the class
    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      //sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_MAGISTRATES_MC_02,
      sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
    );

    //add a single case for all tests in the class in instead of creating a new case for each test
    //sets caseCreated to true so that it doesn't create a new case for each test in test class
    if (caseCreated === false) {
      //add new case
      await homePage.sidebarComponent.openAddNewCasePage();
      hmctsCaseNumber = 'HMCTS_CN_' + addNewCasePage.hmctsCaseNumber;
      caseName = 'AUTO_' + addNewCasePage.hmctsCaseNumber;
      //Test data
      const caseData = {
        hmctsCaseNumberHeaderValue: addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
        caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
        jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
        service: addNewCasePage.CONSTANTS.SERVICE_DIVORCE,
        caseType: addNewCasePage.CONSTANTS.DECREE_ABSOLUTE_CASE_TYPE,
        region: addNewCasePage.CONSTANTS.REGION_WALES,
        cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
        hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
        currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
      };

      await addNewCasePage.addNewCaseWithMandatoryData(caseData, hmctsCaseNumber, caseName);
      caseCreated = true;
     }
  });

  test('Only the session-supported hearing channels should be displayed', async ({editNewCasePage,
                                       caseDetailsPage,
                                       addNewCasePage,
                                       listingRequirementsPage,
                                       homePage,
                                       caseSearchPage,
                                       hearingSchedulePage,
                                       sessionBookingPage,
                                       }) => {

    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_ROOM_NAME_LEICESTER_CC_7,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: hmctsCaseNumber,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    //LISTING REQUIREMENTS
    await editNewCasePage.sidebarComponent.openListingRequirementsPage();
    //checks header
    await expect(caseDetailsPage.listingRequirementsHeader).toBeVisible();

    //select hearing type
    await caseDetailsPage.hearingTypeSelect.selectOption(addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF);

    //select hearing channel
    await listingRequirementsPage.parentHearingChannel.click();
    await listingRequirementsPage.setHearingChannel(listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_IN_PERSON);
    await listingRequirementsPage.setHearingChannel(listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_TELEPHONE);
    await caseDetailsPage.saveButton.click();

    await createHearingSession(
      caseName,
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

  //add case to cart...............125
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

  if (await sessionBookingPage.sessionExpandButton.isVisible())
      await sessionBookingPage.toggleSessionBtn.click();

   await hearingSchedulePage.waitForLoad();

  // asserting that only phone icon is displayed
  const allIcons= await sessionBookingPage.hearingIconAll.count();
  const phoneIcons = await sessionBookingPage.hearingIconEarphone .count();

  expect ( phoneIcons === allIcons && phoneIcons > 0) .toBeTruthy() ;

}
