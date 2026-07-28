import { expect, test } from "../../fixtures";
import { config } from "../../utils";
import {
  clearDownSchedule,
  clearDownScheduleFromSessionSummary,
} from "../../utils/cleardown.utils";

test.describe("Case Creation - Add Multiple Cases with Report Data Update", () => {
  test("should create multiple cases with specified data and update report data @multi-case", async ({
    page,
    homePage,
    loginPage,
    hearingSchedulePage,
    addNewCasePage,
    caseSearchPage,
    editNewCasePage,
    dataUtils,
    sessionBookingPage,
  }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login("ROBERT_SULLIVAN");
    // Empties cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    await clearDownScheduleFromSessionSummary(
      sessionBookingPage,
      hearingSchedulePage,
      sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
      sessionBookingPage.CONSTANTS
        .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
      sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
      dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );

    const hmctsCaseNumberOne = process.env.HMCTS_CASE_NUMBER_ONE as string;
    const caseNameOne = process.env.CASE_NAME_ONE as string;
    const hmctsCaseNumberTwo = process.env.HMCTS_CASE_NUMBER_TWO as string;
    const caseNameTwo = process.env.CASE_NAME_TWO as string;
    const hmctsCaseNumberThree = process.env.HMCTS_CASE_NUMBER_THREE as string;
    const caseNameThree = process.env.CASE_NAME_THREE as string;
    const hmctsCaseNumberFour = process.env.HMCTS_CASE_NUMBER_FOUR as string;
    const caseNameFour = process.env.CASE_NAME_FOUR as string;
    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);

    await test.step("create all configured cases", async () => {
      await createAllCases(
        addNewCasePage,
        homePage,
        hearingSchedulePage,
        editNewCasePage,
        caseSearchPage,
        dataUtils,
        givenName,
        lastName,
        {
          hmctsCaseNumberOne,
          caseNameOne,
          hmctsCaseNumberTwo,
          caseNameTwo,
          hmctsCaseNumberThree,
          caseNameThree,
          hmctsCaseNumberFour,
          caseNameFour,
        },
      );
    });

    await goToHearingSchedulePageAndSetFilters(
      hearingSchedulePage,
      sessionBookingPage,
      dataUtils,
    );
  });
});

async function goToHearingSchedulePageAndSetFilters(
  hearingSchedulePage,
  sessionBookingPage,
  dataUtils,
) {
  await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
  await sessionBookingPage.updateAdvancedFilterConfig(
    undefined,
    undefined,
    sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_WREXHAM_COUNTY_FC,
    sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_WREXHAM_CRTRM_01,
  );
  await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
  await expect(hearingSchedulePage.header).toBeVisible();
  await hearingSchedulePage.applyPrimaryDateFilter(
    dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
  );
  await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
}

async function createAllCases(
  addNewCasePage,
  homePage,
  hearingSchedulePage,
  editNewCasePage,
  caseSearchPage,
  dataUtils,
  givenName: string,
  lastName: string,
  caseNames: {
    hmctsCaseNumberOne: string;
    caseNameOne: string;
    hmctsCaseNumberTwo: string;
    caseNameTwo: string;
    hmctsCaseNumberThree: string;
    caseNameThree: string;
    hmctsCaseNumberFour: string;
    caseNameFour: string;
  },
) {
  const caseConfigs = [
    {
      caseInTest: "case1",
      jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
      service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
      caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
      region: addNewCasePage.CONSTANTS.REGION_WALES,
      hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
      hmctsCaseNumber: caseNames.hmctsCaseNumberOne,
      caseName: caseNames.caseNameOne,
    },
    {
      caseInTest: "case2",
      jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
      service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
      caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
      region: addNewCasePage.CONSTANTS.REGION_WALES,
      hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
      hmctsCaseNumber: caseNames.hmctsCaseNumberTwo,
      caseName: caseNames.caseNameTwo,
    },
  ];

  for (const config of caseConfigs) {
    const caseData = {
      jurisdiction: config.jurisdiction,
      service: config.service,
      caseType: config.caseType,
      region: config.region,
      hearingCentre: config.hearingCentre,
      hmctsCaseNumber: config.hmctsCaseNumber,
      caseName: config.caseName,
    };

    const { caseNumber, caseName } =
      await addNewCasePage.addNewCaseWithSpecifiedData(
        homePage,
        hearingSchedulePage,
        caseData,
        true,
      );

    expect(caseNumber).toBeDefined();
    expect(caseName).toBeDefined();

    // await addNewCasePage.sidebarComponent.openSearchCasePage();

    // await caseSearchPage.searchCase(caseNumber);
    // await editNewCasePage.addNewParticipantButton.click();
    // await editNewCasePage.createNewParticipant(
    //   editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_PERSON,
    //   editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_INDIVIDUAL,
    //   givenName,
    //   lastName,
    //   editNewCasePage.CONSTANTS.PARTICIPANT_GENDER_MALE,
    //   dataUtils.generateDobInDdMmYyyyForwardSlashSeparators(
    //     dataUtils.getRandomNumberBetween1And50(),
    //   ),
    //   editNewCasePage.CONSTANTS.PARTICIPANT_INTERPRETER_WELSH,
    //   editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_APPLICANT,
    // );
    // await editNewCasePage.checkCaseParticipantTable(
    //   editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
    //   `${lastName}, ${givenName}`,
    //   editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
    // );
  }
}
