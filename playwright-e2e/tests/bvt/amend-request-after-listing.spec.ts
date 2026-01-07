import { test } from "../../fixtures.js";
import { HmiUtils } from "../../utils/hmi.utils.js";
import { expect } from "@playwright/test";
import {
  CaseDetailsPage,
  CaseSearchPage,
  HearingSchedulePage,
  HomePage,
} from "../../page-objects/pages/index.ts";
import { SessionBookingPage } from "../../page-objects/pages/hearings/session-booking.po.ts";
import { clearDownSchedule } from "../../utils/reporting.utils.ts";

test.afterEach(
  async ({ hearingSchedulePage, sessionBookingPage, dataUtils }) => {
    await clearDownMidlandsLeicesterSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      dataUtils,
    );
  },
);

//to skip case creation when running test in isolation, uncomment this line
// process.env.SKIP_CREATE_CASE = 'true';

test.describe("HMI Amend API tests after listing @amend-api-test-after-listing", () => {
  //using test.slow() because this test takes longer than 3 minutes to complete
  test.slow();
  test("Amended participants and their hearing method should display as expected after listing", async ({
    editNewCasePage,
    loginPage,
    page,
    config,
    caseSearchPage,
    dataUtils,
    homePage,
    listingRequirementsPage,
    caseDetailsPage,
    hearingSchedulePage,
    sessionBookingPage,
  }) => {
    // We are expecting the env var SKIP_CREATE_CASE to be true so that case creation is skipped.
    // If this is not the case, the test will run redundant steps unnecessarily.

    const CASE_ID =
      "CASE_ID" + dataUtils.generateRandomAlphabetical(10).toUpperCase();
    const CASE_NAME =
      "CASE_NAME" + dataUtils.generateRandomAlphabetical(10).toUpperCase();

    const payload = config.data.hearingRequest;
    payload["hearingRequest"]["_case"]["caseIdHMCTS"] = CASE_ID;
    payload["hearingRequest"]["_case"]["caseListingRequestId"] = CASE_ID;

    await HmiUtils.requestHearing(payload);
    console.log("\ncase id = " + CASE_ID);

    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser, true);

    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    //clears sessions
    await clearDownMidlandsLeicesterSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      dataUtils,
    );

    const roomData = {
      roomName:
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_LEICESTER_CC_7,
      column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
      caseNumber: CASE_ID,
      sessionDuration:
        sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      hearingType:
        sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
      cancelReason:
        sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
    };

    await createHearingSession(
      CASE_ID,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      roomData,
      sessionBookingPage,
    );
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
      //add case to cart.
      await caseSearchPage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(CASE_ID);

      await caseDetailsPage.addToCartButton.click();
      await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

      //go to hearing schedule page
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
        `Automation internal comments ${process.env.HMCTS_CASE_NUMBER}`,
        `Automation external comments ${process.env.HMCTS_CASE_NUMBER}`,
      );
    }

    await sessionBookingPage.expandRoomButton();

    await expect(sessionBookingPage.allIcons).toHaveCount(2);
    await expect(sessionBookingPage.videoIcons).toHaveCount(1);
    await expect(sessionBookingPage.phoneIcons).toHaveCount(1);
    await expect(sessionBookingPage.inPersonIcons).toHaveCount(0);

    // Amend request
    const amendPayload = config.data.amendHearingRequest;
    amendPayload["hearingRequest"]["_case"]["caseIdHMCTS"] = CASE_ID;
    amendPayload["hearingRequest"]["_case"]["caseTitle"] = CASE_NAME;
    amendPayload["hearingRequest"]["_case"]["caseListingRequestId"] = CASE_ID;

    await HmiUtils.requestAmendHearing(amendPayload, CASE_ID);

    await homePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCaseByName(CASE_NAME);

    await expect(editNewCasePage.caseNameField).toHaveText(CASE_NAME);
    await caseDetailsPage.listingRequirementLink.click();

    // verify main hearing channel after amendment
    const selectedHearingChannels =
      await listingRequirementsPage.getSelectedHearingMethods();
    expect(selectedHearingChannels.length).toBe(1);
    expect(selectedHearingChannels).toEqual(["TEL"]);

    // Verify participant hearing methods after the amendment
    await expect(listingRequirementsPage.participantMethodsLocator).toHaveCount(
      3,
    );
    await listingRequirementsPage.assertHearingMethodValueAt(0, "VID");
    await listingRequirementsPage.assertHearingMethodValueAt(1, "VID");
    await listingRequirementsPage.assertHearingMethodValueAt(2, "");

    await homePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForLoad();
    await sessionBookingPage.expandRoomButton();

    await expect(sessionBookingPage.allIcons).toHaveCount(1);
    await expect(sessionBookingPage.videoIcons).toHaveCount(0);
    await expect(sessionBookingPage.phoneIcons).toHaveCount(1);
    await expect(sessionBookingPage.inPersonIcons).toHaveCount(0);

    // verify session summary table after the amendment

    await sessionBookingPage.scheduleButton.click();

    await expect(sessionBookingPage.sessionSummaryHearingChannel).toHaveText(
      "- Telephone - Other",
    );

    //TODO: uncomment these assertions once the bug is fixed. I'll update the comment with the bug ticket number once it's created.

    /*await expect(sessionBookingPage.sessionSummaryAttendees).toHaveCount(3);

      await expect(sessionBookingPage.sessionSummaryAttendees.nth(0)).toContainText("John Smith");
      await expect(sessionBookingPage.sessionSummaryAttendees.nth(0)).toContainText("Video - CVP");

      await expect(sessionBookingPage.sessionSummaryAttendees.nth(1)).toContainText(
          "Legal Solicitor",
      );
      await expect(sessionBookingPage.sessionSummaryAttendees.nth(1)).toContainText("Video - CVP");

      const attendee3Text = await sessionBookingPage.sessionSummaryAttendees.nth(2).innerText();
      await expect(attendee3Text).toMatch(/FPRL-test-organisation/);
      await expect(attendee3Text).not.toMatch(/: (In Person|Telephone|Video)/);
    */
  });
});

async function clearDownMidlandsLeicesterSchedule(
  sessionBookingPage,
  hearingSchedulePage,
  dataUtils,
) {
  await clearDownSchedule(
    sessionBookingPage,
    hearingSchedulePage,
    sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_MIDLANDS,
    sessionBookingPage.CONSTANTS
      .CASE_LISTING_CLUSTER_MIDLANDS_LEICESTERSHIRE_RUTLAND_LINCOLNSHIRE_NORTH,
    sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_LEICESTER_CC,
    sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_LEICESTER_CC_7,
    sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
    dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
  );
}
