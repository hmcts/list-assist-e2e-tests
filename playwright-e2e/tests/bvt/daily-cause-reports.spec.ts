import { expect, test } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import {
  CaseDetailsPage,
  CaseSearchPage,
  HearingSchedulePage,
  HomePage,
} from "../../page-objects/pages/index.ts";
import { SessionBookingPage } from "../../page-objects/pages/hearings/session-booking.po.ts";
import { clearDownSchedule } from "../../utils/reporting.utils.ts";

test.beforeEach(
  async ({
    page,
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
    loginPage,
  }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser);

    await clearDownPontypriddSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      dataUtils,
    );
  },
);

test.afterEach(
  async ({ page, sessionBookingPage, hearingSchedulePage, dataUtils }) => {
    await page.goto(config.urls.baseUrl);

    await clearDownPontypriddSchedule(
      sessionBookingPage,
      hearingSchedulePage,
      dataUtils,
    );
  },
);

test.describe("Daily Cause List Report tests @daily-cause-list-tests", () => {
  test.slow();

  test("Should release a session and generate both external and internal hearing list reports", async ({
    page,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
    addNewCasePage,
    editNewCasePage,
    listingRequirementsPage,
  }) => {
    const caseNumber = process.env.HMCTS_CASE_NUMBER;
    const caseName = process.env.CASE_NAME;
    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);
    const partyName = `${givenName} ${lastName}`;

    if (!caseNumber || !caseName) {
      throw new Error(
        "Missing required env vars: HMCTS_CASE_NUMBER or CASE_NAME",
      );
    }

    const {
      CASE_LISTING_REGION_WALES,
      CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
      CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      CASE_LISTING_COLUMN_ONE,
      CASE_LISTING_SESSION_DURATION_1_00,
      CASE_LISTING_HEARING_TYPE_APPLICATION,
      CASE_LISTING_CANCEL_REASON_AMEND,
      CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
      AUTO_JUDICIAL_OFFICE_HOLDER_02,
    } = sessionBookingPage.CONSTANTS;

    const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
    const formattedReportDate =
      dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName();
    const welshDate =
      dataUtils.getFormattedWelshDateForReportAssertionUsingWelshDateStringWithDayName();
    const combinedDate = `${welshDate}, ${formattedReportDate}`;

    await test.step("Login and prepare test case", async () => {
      await page.goto(config.urls.baseUrl);

      await hearingSchedulePage.sidebarComponent.emptyCaseCart();

      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(caseNumber);
      await expect(editNewCasePage.caseNameField).toHaveText(caseName);
    });

    await test.step("add case participants and their hearing channel via case details page", async () => {
      await editNewCasePage.createNewParticipant(
        editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_PERSON,
        editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_INDIVIDUAL,
        givenName,
        lastName,
        editNewCasePage.CONSTANTS.PARTICIPANT_GENDER_MALE,
        dataUtils.generateDobInDdMmYyyyForwardSlashSeparators(
          dataUtils.getRandomNumberBetween1And50(),
        ),
        editNewCasePage.CONSTANTS.PARTICIPANT_INTERPRETER_WELSH,
        editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_APPLICANT,
      );

      await editNewCasePage.checkCaseParticipantTable(
        editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
        `${lastName}, ${givenName}`,
        editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
      );
    });

    await test.step("add listing hearing channel via listing requirements page", async () => {
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
      await caseDetailsPage.hearingTypeSelect.selectOption(
        addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
      );

      //select hearing channel
      await listingRequirementsPage.parentHearingChannel.click();
      await listingRequirementsPage.setHearingChannel(
        listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_IN_PERSON,
      );
      await listingRequirementsPage.setHearingChannel(
        listingRequirementsPage.CONSTANTS.PARENT_HEARING_CHANNEL_TELEPHONE,
      );
      await caseDetailsPage.saveButton.click();
    });

    await test.step("Clear existing schedule and create new released session", async () => {
      await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

      await sessionBookingPage.updateAdvancedFilterConfig(
        CASE_LISTING_REGION_WALES,
        CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
      );

      await createHearingSession(
        {
          homePage,
          caseSearchPage,
          caseDetailsPage,
          hearingSchedulePage,
          sessionBookingPage,
        },
        {
          roomName: CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
          column: CASE_LISTING_COLUMN_ONE,
          caseNumber,
          sessionDuration: CASE_LISTING_SESSION_DURATION_1_00,
          hearingType: CASE_LISTING_HEARING_TYPE_APPLICATION,
          cancelReason: CASE_LISTING_CANCEL_REASON_AMEND,
          sessionStatus: CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
          sessionJoh: AUTO_JUDICIAL_OFFICE_HOLDER_02,
        },
      );
    });

    await test.step("Generate external hearing list report", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
      );

      const expected = reportsRequestPage.buildEnglishDailyCauseListArray(
        "10:00 AM",
        "1 hour",
        `${caseNumber} ${caseName}`,
        "Application",
        "Telephone - Other",
        partyName,
      );

      //await viewReportsPage.assertSSRSReportTable(expected);
      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });

    await test.step("Generate internal hearing list report (damages)", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
        viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
      );

      const expected = reportsRequestPage.buildEnglishDailyCauseListArray(
        "10:00 AM",
        "1 hour",
        `${caseNumber} ${caseName}`,
        "Application",
        "Telephone - Other",
        partyName,
      );

      //await viewReportsPage.assertSSRSReportTable(expected);
      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });
    await test.step("Generate external hearing list Welsh report", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        combinedDate,
        undefined,
        true,
      );

      const expected = reportsRequestPage.buildWelshDailyCauseListArray(
        "10:00 AM",
        "1 awr, hour",
        `${caseNumber} ${caseName}`,
        "Cais, Application",
        "Dros y FfÇïn - Arall/Telephone - Other",
        partyName,
      );

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });
  });

  // Reusable helper
  async function createHearingSession(
    pages: {
      homePage: HomePage;
      caseSearchPage: CaseSearchPage;
      caseDetailsPage: CaseDetailsPage;
      hearingSchedulePage: HearingSchedulePage;
      sessionBookingPage: SessionBookingPage;
    },
    roomData: {
      roomName: string;
      column: string;
      caseNumber: string;
      sessionDuration: string;
      hearingType: string;
      cancelReason: string;
      sessionStatus: string;
      sessionJoh?: string;
    },
  ) {
    const {
      homePage,
      caseSearchPage,
      caseDetailsPage,
      hearingSchedulePage,
      sessionBookingPage,
    } = pages;

    await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();
    await homePage.upperbarComponent.currentCaseDropdownButton.click();

    await expect(
      homePage.upperbarComponent.currentCaseDropdownList,
    ).toContainText(homePage.upperbarComponent.currentCaseDropDownItems);

    await caseSearchPage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(roomData.caseNumber);
    await expect(caseDetailsPage.addToCartButton).toBeVisible();
    await caseDetailsPage.addToCartButton.click();
    await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

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
      roomData.sessionJoh,
      undefined,
      undefined,
      `Automation internal comments ${process.env.HMCTS_CASE_NUMBER}`,
      `Automation external comments ${process.env.HMCTS_CASE_NUMBER}`,
    );

    await expect(
      hearingSchedulePage.confirmListingReleasedStatus,
    ).toBeVisible();
  }
});

async function clearDownPontypriddSchedule(
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
    sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
    sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
    sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
    dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
  );
}
