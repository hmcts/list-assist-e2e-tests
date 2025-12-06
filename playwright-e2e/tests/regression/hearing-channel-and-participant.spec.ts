import { expect, test } from "../../fixtures";
import { HomePage, CaseSearchPage, CaseDetailsPage, HearingSchedulePage } from "../../page-objects/pages";
import { SessionBookingPage } from "../../page-objects/pages/hearings/session-booking.po";
import { config } from "../../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Regression: Hearing Channel + Participant E2E @regression", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page, hearingSchedulePage, sessionBookingPage, dataUtils }) => {
    await page.goto(config.urls.baseUrl);
    // Empty cart and clear schedule to avoid test flakiness
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    await hearingSchedulePage.clearDownSchedule(
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_LEICESTER_CC_7,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );
  });

  test("Set hearing channel, add participant and schedule hearing", async ({
    editNewCasePage,
    caseDetailsPage,
    addNewCasePage,
    listingRequirementsPage,
    homePage,
    caseSearchPage,
    hearingSchedulePage,
    sessionBookingPage,
    dataUtils,
  }) => {
    // Prepare room/data
    const roomData = {
      roomName: sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_LEICESTER_CC_7,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: process.env.HMCTS_CASE_NUMBER as string,
      sessionDuration: sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType: sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason: sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    // LISTING REQUIREMENTS -> Add Telephone + In Person channels
    await editNewCasePage.sidebarComponent.openListingRequirementsPage();
    await expect
      .poll(async () => {
        return await caseDetailsPage.listingRequirementsHeader.isVisible();
      }, { intervals: [2000], timeout: 20000 })
      .toBeTruthy();

    await caseDetailsPage.hearingTypeSelect.selectOption(addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF);
    // Open and set hearing channels via listingRequirementsPage
    await listingRequirementsPage.parentHearingChannel.click();
    await listingRequirementsPage.setHearingChannel(listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_IN_PERSON);
    await listingRequirementsPage.setHearingChannel(listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_TELEPHONE);
    await caseDetailsPage.saveButton.click();

    // Use component for setting hearing channels
    // listingRequirementsPage is a page fixture; import via fixture list in function arguments if needed
    // We will select in-person + telephone using page's listing requirements page fixture
    // For safety, import dynamically from fixture if present
    // (We don't want to add a hard import here to avoid double-registration)

    // Create a participant on the case
    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);

    // Navigate to the search case and open case details
    await editNewCasePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

    // Add new participant via EditCase page
    await expect(editNewCasePage.caseParticipantsHeader).toBeVisible();
    await expect(editNewCasePage.addNewParticipantButton).toBeVisible();
    await editNewCasePage.addNewParticipantButton.click();

    await editNewCasePage.createNewParticipant(
      editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_PERSON,
      editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_INDIVIDUAL,
      givenName,
      lastName,
      editNewCasePage.CONSTANTS.PARTICIPANT_GENDER_MALE,
      dataUtils.generateDobInDdMmYyyyForwardSlashSeparators(dataUtils.getRandomNumberBetween1And50()),
      editNewCasePage.CONSTANTS.PARTICIPANT_INTERPRETER_WELSH,
      editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_APPLICANT,
    );

    await editNewCasePage.checkCaseParticipantTable(
      editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
      `${lastName}, ${givenName}`,
      editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
    );

    // Save listing requirements and schedule the hearing for this case
    // Add to cart
    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
    await caseSearchPage.addToCartButton.click();
    await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();

    // Go to hearing schedule and schedule
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();
    await hearingSchedulePage.scheduleHearingWithBasket(
      roomData.roomName,
      roomData.column,
      roomData.caseNumber,
    );

    await sessionBookingPage.bookSession(
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
    );

    await hearingSchedulePage.waitForLoad();
    await sessionBookingPage.expandRoomButton();

    // Validate expected icons
    const phoneIcons = await sessionBookingPage.phoneIcons.count();
    expect(phoneIcons).toBe(1);

    const interpreterIcons = await sessionBookingPage.interpreterLanguageIcon.count();
    // interpreter icon should be present for the session since the participant has an interpreter selected
    expect(interpreterIcons).toBeGreaterThanOrEqual(1);
  });
});
