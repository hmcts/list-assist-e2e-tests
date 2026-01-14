import { expect, test } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import { Page } from "@playwright/test";
import {
  CaseDetailsPage,
  CaseSearchPage,
  HearingSchedulePage,
  HomePage,
  LoginPage,
} from "../../page-objects/pages/index.ts";
import { SessionBookingPage } from "../../page-objects/pages/hearings/session-booking.po.ts";
import { AddNewCasePage } from "../../page-objects/pages/cases/add-new-case.po.ts";

test.describe("Hearing List anonymisation @anonymisation @regression", () => {
  test.slow();
  test.describe.configure({ mode: "serial" });
  test("Civil - case name suppression", async ({
    page,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
    loginPage,
    addNewCasePage,
    editNewCasePage,
  }) => {
    // party details
    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);
    const partyName = `${givenName} ${lastName}`;

    // case name suppression value
    const caseNameSuppression = dataUtils.generateRandomAlphabetical(10);
    const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
    const formattedReportDate =
      dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName();
    const welshDate =
      dataUtils.getFormattedWelshDateForReportAssertionUsingWelshDateStringWithDayName();
    const combinedDate = `${welshDate}, ${formattedReportDate}`;

    // Create new Civil Damages Small Claims case
    const { caseNumber, caseName } =
      await test.step("login and Create Civil Damages Small Claims case for case-name suppression", async () =>
        await createNewCase({
          page,
          loginPage,
          homePage,
          addNewCasePage,
          hearingSchedulePage,
        },
            {
              jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
              service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
              caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
              region: addNewCasePage.CONSTANTS.REGION_WALES,
              cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
              hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
              hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
              currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,

            }));

    await test.step("Open newly created case", async () => {
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(caseNumber);
      await expect(editNewCasePage.caseNameField).toHaveText(caseName);
    });

    await test.step("add case participants", async () => {
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

    await test.step("add Case Name Suppression value", async () => {
      await editNewCasePage.setCaseNameSuppression(caseNameSuppression);
    });


      await test.step("Clear existing schedule and create new released session", async () => {

          const listingDate =
              dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0);
          await clearScheduleAndCreateReleasedSession(
              {
                  homePage,
                  caseSearchPage,
                  caseDetailsPage,
                  hearingSchedulePage,
                  sessionBookingPage,
              },
              caseNumber,
              listingDate,
          );
      });

      await test.step("Verify External report shows suppressed case name and real party name", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
      );

      const expected = [
        {
          header: "Case Details",
          value: `${caseNumber} ${caseNameSuppression}`,
        },
        {
          header: "Party Name",
          value: partyName,
        },
      ];

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });

    await test.step("verify internal hearing list report (damages)no suppression should apply on Case Name", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
        viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
      );

      const expected = [
        {
          header: "Case Details",
          value: `${caseNumber} ${caseName}`,
        },
        {
          header: "Party Name",
          value: partyName,
        },
      ];

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });
    await test.step("verify external hearing list Welsh report shows suppressed case name and real party name", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        combinedDate,
        undefined,
        true,
      );

      const expected = [
        {
          header: "Manylion yr Achos, Case Detail",
          value: `${caseNumber} Hawliadau Bychain, ${caseNameSuppression}`,
        },
        {
          header: "Party Name",
          value: partyName,
        },
      ];
      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });
  });

  test("Civil case with parties & Alternative/Suppression applied to individual parties.", async ({
    page,
    sessionBookingPage,
    caseSearchPage,
    caseDetailsPage,
    hearingSchedulePage,
    homePage,
    viewReportsPage,
    dataUtils,
    loginPage,
    addNewCasePage,
    editNewCasePage,
  }) => {
    // party details

    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);
    const partyName = `${givenName} ${lastName}`;
    const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
    const formattedReportDate =
      dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName();
    const welshDate =
      dataUtils.getFormattedWelshDateForReportAssertionUsingWelshDateStringWithDayName();
    const combinedDate = `${welshDate}, ${formattedReportDate}`;

    // Create new Civil Damages Small Claims case
    const { caseNumber, caseName } =
      await test.step("login and Create Civil Damages Small Claims case for party suppression", async () =>
        await createNewCase({
          page,
          loginPage,
          homePage,
          addNewCasePage,
          hearingSchedulePage,
        },
            {

              jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
              service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
              caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
              region: addNewCasePage.CONSTANTS.REGION_WALES,
              cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
              hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
              hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
              currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
            }
            ));

    await test.step("Open newly created case", async () => {
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(caseNumber);
      await expect(editNewCasePage.caseNameField).toHaveText(caseName);
    });

    await test.step("add case participants with default Allternative/Suppression value", async () => {
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
        true,
      );

      await editNewCasePage.checkCaseParticipantTable(
        editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
        `${lastName}, ${givenName}`,
        editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
      );
    });


      await test.step("Clear existing schedule and create new released session", async () => {

          const listingDate =
              dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0);
          await clearScheduleAndCreateReleasedSession(
              {
                  homePage,
                  caseSearchPage,
                  caseDetailsPage,
                  hearingSchedulePage,
                  sessionBookingPage,
              },
              caseNumber,
              listingDate,
          );
      });

      await test.step("Verify External report shows real case name and suppressed party name", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
      );

      const expected = [
        {
          header: "Case Details",
          value: `${caseNumber} ${caseName}`,
        },
        {
          header: "Party Name",
          value: "Party Suppression Default Value",
        },
      ];

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });

    await test.step("verify internal hearing list report (damages) shows no suppression should apply", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        formattedReportDate,
        viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
      );

      const expected = [
        {
          header: "Case Details",
          value: `${caseNumber} ${caseName}`,
        },
        {
          header: "Party Name",
          value: partyName,
        },
      ];

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });
    await test.step("verify external hearing list Welsh report shows real case name and suppressed party name", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
        todayDate,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        combinedDate,
        undefined,
        true,
      );

      const expected = [
        {
          header: "Manylion yr Achos, Case Detail",
          value: `${caseNumber} ${caseName}`,
        },
        {
          header: "Party Name",
          value: "Party Suppression Default Value",
        },
      ];

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });
  });

  //-- End of test Civil cases

    //Family Cases --- -- case type suppression (default)

  test("Family Case (Private Law) with parties; case type suppression (default)", async ({
                                                 page,
                                                 sessionBookingPage,
                                                 caseSearchPage,
                                                 caseDetailsPage,
                                                 hearingSchedulePage,
                                                 homePage,
                                                 viewReportsPage,
                                                 dataUtils,
                                                 loginPage,
                                                 addNewCasePage,
                                                 editNewCasePage,
                                               }) => {
    const givenName = dataUtils.generateRandomAlphabetical(7);
    const lastName = dataUtils.generateRandomAlphabetical(8);
    const caseNameSuppression = "Re A Minor";
    const partyName = `${givenName} ${lastName}`;
    const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
    const formattedReportDate =
        dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName();
    const welshDate =
        dataUtils.getFormattedWelshDateForReportAssertionUsingWelshDateStringWithDayName();
    const combinedDate = `${welshDate}, ${formattedReportDate}`;

    // Create new Family case
    const { caseNumber, caseName } =
        await test.step("login and Create Family Case (Private Law) with parties, default suppression", async () =>
            await createNewCase({
                  page,
                  loginPage,
                  homePage,
                  addNewCasePage,
                  hearingSchedulePage,
                },
                {

                  jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
                  service: addNewCasePage.CONSTANTS.SERVICE_PRIVATE_LAW,

                  region: addNewCasePage.CONSTANTS.REGION_WALES,
                  cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
                  hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
                  hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
                  currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
                }
            ));

    await test.step("Open newly created case", async () => {
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(caseNumber);
      await expect(editNewCasePage.caseNameField).toHaveText(caseName);
    });

      await test.step("add case participants", async () => {
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



      await test.step("Clear existing schedule and create new released session", async () => {

          const listingDate =
              dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0);
          await clearScheduleAndCreateReleasedSession(
              {
                  homePage,
                  caseSearchPage,
                  caseDetailsPage,
                  hearingSchedulePage,
                  sessionBookingPage,
              },
              caseNumber,
              listingDate,
          );
      });

    await test.step("Verify External report shows default suppressed case name suppressed party name", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
          todayDate,
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
          sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
          viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
          formattedReportDate,
      );

      const expected = [
        {
          header: "Case Details",
          value: `${caseNumber} ${caseNameSuppression}`,
        },
        {
          header: "Party Name",
          value: "Parties Suppressed",
        },
      ];

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });

      await test.step("verify external hearing list Welsh report shows default suppressed case name suppressed party name", async () => {
          const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
              todayDate,
              sessionBookingPage.CONSTANTS
                  .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
              sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
              viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
              combinedDate,
              undefined,
              true,
          );

          const expected = [
              {
                  header: "Manylion yr Achos, Case Detail",
                  value: `${caseNumber} Cyfraith Teulu Breifat, ${caseNameSuppression}`,
              },
              {
                  header: "Enw’r Blaid, Party Name",
                  value: "Enwau’r partïon wedi’u hatal, Parties Suppressed",
              },
          ];

          await reportsRequestPage.assertDailyCauseListsByText(expected);
      });

    await test.step("verify internal hearing list report no suppression should apply on Case Name and Part name", async () => {
      const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
          todayDate,
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
          sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
          viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
          formattedReportDate,
          addNewCasePage.CONSTANTS.SERVICE_PRIVATE_LAW,
      );

      const expected = [
        {
          header: "Case Details",
          value: `${caseNumber} ${caseName}`,
        },
        {
          header: "Party Name",
          value: partyName,
        },
      ];

      await reportsRequestPage.assertDailyCauseListsByText(expected);
    });

  });

  // Family case --- case name suppression

    test("Family Case (Private Law) with parties; with Case Name Suppression added", async ({
                                                                                               page,
                                                                                               sessionBookingPage,
                                                                                               caseSearchPage,
                                                                                               caseDetailsPage,
                                                                                               hearingSchedulePage,
                                                                                               homePage,
                                                                                               viewReportsPage,
                                                                                               dataUtils,
                                                                                               loginPage,
                                                                                               addNewCasePage,
                                                                                               editNewCasePage,
                                                                                           }) => {
        // case name suppression value
        const caseNameSuppression = dataUtils.generateRandomAlphabetical(10);
        // party details
        const givenName = dataUtils.generateRandomAlphabetical(7);
        const lastName = dataUtils.generateRandomAlphabetical(8);
        const partyName = `${givenName} ${lastName}`;
        const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
        const formattedReportDate =
            dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName();
        const welshDate =
            dataUtils.getFormattedWelshDateForReportAssertionUsingWelshDateStringWithDayName();
        const combinedDate = `${welshDate}, ${formattedReportDate}`;

        // Create new Family case
        const { caseNumber, caseName } =
            await test.step("login and Create Family Case (Private Law) with parties", async () =>
                await createNewCase({
                        page,
                        loginPage,
                        homePage,
                        addNewCasePage,
                        hearingSchedulePage,
                    },
                    {

                        jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
                        service: addNewCasePage.CONSTANTS.SERVICE_FINANCIAL_DISPUTE,
                        region: addNewCasePage.CONSTANTS.REGION_WALES,
                        cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
                        hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
                        hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
                        currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
                    }
                ));

        await test.step("Open newly created case", async () => {
            await addNewCasePage.sidebarComponent.openSearchCasePage();
            await caseSearchPage.searchCase(caseNumber);
            await expect(editNewCasePage.caseNameField).toHaveText(caseName);
        });

        await test.step("add case participants", async () => {
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

        await test.step("add Family case Name Suppression value", async () => {
            await editNewCasePage.setCaseNameSuppression(caseNameSuppression);
        });


        await test.step("Clear existing schedule and create new released session", async () => {

            const listingDate =
                dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0);
            await clearScheduleAndCreateReleasedSession(
                {
                    homePage,
                    caseSearchPage,
                    caseDetailsPage,
                    hearingSchedulePage,
                    sessionBookingPage,
                },
                caseNumber,
                listingDate,
            );
        });

        await test.step("Verify External report shows manually entered suppressed case name & party name replaced Parties Suppressed", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                formattedReportDate,
            );

            const expected = [
                {
                    header: "Case Details",
                    value: `${caseNumber} ${caseNameSuppression}`,
                },
                {
                    header: "Party Name",
                    value: "Parties Suppressed",
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

        await test.step("verify external hearing list Welsh report shows manually entered suppressed case name and part name replaced with Parties Suppressed", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                combinedDate,
                undefined,
                true,
            );

            const expected = [
                {
                    header: "Manylion yr Achos, Case Detail",
                    value: `${caseNumber} Par: Plentyn, ${caseNameSuppression}`,
                },
                {
                    header: "Enw’r Blaid, Party Name",
                    value: "Enwau’r partïon wedi’u hatal, Parties Suppressed",
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

        await test.step("verify internal hearing list report, no suppression should apply on case Name and parties name", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                formattedReportDate,
                addNewCasePage.CONSTANTS.SERVICE_PRIVATE_LAW,
            );

            const expected = [
                {
                    header: "Case Details",
                    value: `${caseNumber} ${caseName}`,
                },
                {
                    header: "Party Name",
                    value: partyName,
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

    });

    //Family case --- "Alternative/Suppression" with parties & "Alternative/Suppression" applied
    //TODO: Uncomment the following test once the bug under MCGIRRSD-78068 is fixed.
    /*
    test("Family Case (Private Law) with parties & Alternative/Suppression applied to individual parties.", async ({
                                                                                               page,
                                                                                               sessionBookingPage,
                                                                                               caseSearchPage,
                                                                                               caseDetailsPage,
                                                                                               hearingSchedulePage,
                                                                                               homePage,
                                                                                               viewReportsPage,
                                                                                               dataUtils,
                                                                                               loginPage,
                                                                                               addNewCasePage,
                                                                                               editNewCasePage,
                                                                                           }) => {
        const givenName = dataUtils.generateRandomAlphabetical(7);
        const lastName = dataUtils.generateRandomAlphabetical(8);
        const caseNameSuppression = "Re A Minor";
        const partyName = `${givenName} ${lastName}`;
        const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
        const formattedReportDate =
            dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName();
        const welshDate =
            dataUtils.getFormattedWelshDateForReportAssertionUsingWelshDateStringWithDayName();
        const combinedDate = `${welshDate}, ${formattedReportDate}`;

        // Create new Family case
        const { caseNumber, caseName } =
            await test.step("login and Create Family Case (Private Law) with parties, default suppression", async () =>
                await createNewCase({
                        page,
                        loginPage,
                        homePage,
                        addNewCasePage,
                        hearingSchedulePage,
                    },
                    {
                        jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
                        service: addNewCasePage.CONSTANTS.SERVICE_PRIVATE_LAW,
                        region: addNewCasePage.CONSTANTS.REGION_WALES,
                        cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
                        hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
                        hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
                        currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
                    }
                ));

        await test.step("Open newly created case", async () => {
            await addNewCasePage.sidebarComponent.openSearchCasePage();
            await caseSearchPage.searchCase(caseNumber);
            await expect(editNewCasePage.caseNameField).toHaveText(caseName);
        });

        await test.step("add case participants with default Allternative/Suppression value", async () => {
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
                true,
            );

            await editNewCasePage.checkCaseParticipantTable(
                editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
                `${lastName}, ${givenName}`,
                editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
            );
        });

        await test.step("Clear existing schedule and create new released session", async () => {

          const listingDate =
              dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0);
          await clearScheduleAndCreateReleasedSession(
              {
                  homePage,
                  caseSearchPage,
                  caseDetailsPage,
                  hearingSchedulePage,
                  sessionBookingPage,
              },
              caseNumber,
              listingDate,
          );
      });

    await test.step("Verify External report shows default suppressed case name & default Alternative/Suppression value for party name", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                formattedReportDate,
            );

            const expected = [
                {
                    header: "Case Details",
                    value: `${caseNumber} ${caseNameSuppression}`,
                },
                {
                    header: "Party Name",
                    value: "Party Suppression Default Value",
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

        await test.step("verify external hearing list Welsh report shows suppressed case name & default Alternative/Suppression value for party name", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                combinedDate,
                undefined,
                true,
            );

            const expected = [
                {
                    header: "Manylion yr Achos, Case Detail",
                    value: `${caseNumber} Par: Plentyn, ${caseNameSuppression}`,
                },
                {
                    header: "Enw’r Blaid, Party Name",
                    value: "Party Suppression Default Value",
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

        await test.step("verify internal hearing list report no suppression should apply on Case Name", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                formattedReportDate,
                addNewCasePage.CONSTANTS.SERVICE_PRIVATE_LAW,
            );

            const expected = [
                {
                    header: "Case Details",
                    value: `${caseNumber} ${caseName}`,
                },
                {
                    header: "Party Name",
                    value: partyName,
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

    });

*/
//Family Case (Financial Dispute) with parties & no suppression

    test("Family Case (Financial Dispute) with parties & no suppression", async ({
                                                                                     page,
                                                                                     sessionBookingPage,
                                                                                     caseSearchPage,
                                                                                     caseDetailsPage,
                                                                                     hearingSchedulePage,
                                                                                     homePage,
                                                                                     viewReportsPage,
                                                                                     dataUtils,
                                                                                     loginPage,
                                                                                     addNewCasePage,
                                                                                     editNewCasePage,
                                                                                 }) => {
        
        const givenName = dataUtils.generateRandomAlphabetical(7);
        const lastName = dataUtils.generateRandomAlphabetical(8);
        const partyName = `${givenName} ${lastName}`;
        const todayDate = dataUtils.generateDateInYyyyMmDdNoSeparators(0);
        const formattedReportDate =
            dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName();
        const welshDate =
            dataUtils.getFormattedWelshDateForReportAssertionUsingWelshDateStringWithDayName();
        const combinedDate = `${welshDate}, ${formattedReportDate}`;

        // Create new Family case
        const { caseNumber, caseName } =
            await test.step("login and Create Family (Financial Dispute) with parties & no suppression", async () =>
                await createNewCase({
                        page,
                        loginPage,
                        homePage,
                        addNewCasePage,
                        hearingSchedulePage,
                    },
                    {

                        jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_FAMILY,
                        service: addNewCasePage.CONSTANTS.SERVICE_FINANCIAL_DISPUTE,
                        region: addNewCasePage.CONSTANTS.REGION_WALES,
                        cluster: addNewCasePage.CONSTANTS.CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
                        hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
                        hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
                        currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
                    }
                ));

        await test.step("Open newly created case", async () => {
            await addNewCasePage.sidebarComponent.openSearchCasePage();
            await caseSearchPage.searchCase(caseNumber);
            await expect(editNewCasePage.caseNameField).toHaveText(caseName);
        });

        await test.step("add case participants", async () => {
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

        await test.step("Clear existing schedule and create new released session", async () => {

            const listingDate =
                dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0);
            await clearScheduleAndCreateReleasedSession(
                {
                    homePage,
                    caseSearchPage,
                    caseDetailsPage,
                    hearingSchedulePage,
                    sessionBookingPage,
                },
                caseNumber,
                listingDate,
            );
        });
        

        await test.step("Verify External report shows Case Name followed by case number and actual part names", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                formattedReportDate,
            );

            const expected = [
                {
                    header: "Case Details",
                    value: `${caseNumber} ${caseName}`,
                },
                {
                    header: "Party Name",
                    value: partyName,
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

        await test.step("verify external hearing list Welsh report shows Case Name followed by case number and actual party names", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                combinedDate,
                undefined,
                true,
            );

            const expected = [
                {
                    header: "Manylion yr Achos, Case Detail",
                    value: `${caseNumber} ${caseName}`,
                },
                {
                    header: "Enw’r Blaid, Party Name",
                    value: partyName,
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

        await test.step("verify internal hearing list report, no suppression should apply on case Name and parties name", async () => {
            const reportsRequestPage = await viewReportsPage.reportRequestPageActions(
                todayDate,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                viewReportsPage.CONSTANTS.JURISDICTION_FAMILY,
                formattedReportDate,
                addNewCasePage.CONSTANTS.SERVICE_FINANCIAL_DISPUTE,
            );

            const expected = [
                {
                    header: "Case Details",
                    value: `${caseNumber} ${caseName}`,
                },
                {
                    header: "Party Name",
                    value: partyName,
                },
            ];

            await reportsRequestPage.assertDailyCauseListsByText(expected);
        });

    });

  // Reusable helpers


    async function clearScheduleAndCreateReleasedSession(
        pages: {
            homePage: HomePage;
            caseSearchPage: CaseSearchPage;
            caseDetailsPage: CaseDetailsPage;
            hearingSchedulePage: HearingSchedulePage;
            sessionBookingPage: SessionBookingPage;
        },
        caseNumber: string,
        listingDate: string,
    ) {
        const sessionConstants = pages.sessionBookingPage.CONSTANTS;

        await pages.sessionBookingPage.sidebarComponent.openHearingSchedulePage();

        await pages.sessionBookingPage.updateAdvancedFilterConfig(
            sessionConstants.CASE_LISTING_REGION_WALES,
            sessionConstants.CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
            sessionConstants.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
            sessionConstants.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
        );

        await pages.hearingSchedulePage.clearDownSchedule(
            sessionConstants.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
            sessionConstants.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
            listingDate,
        );

        await createHearingSession(
            pages,
            {
                roomName: sessionConstants.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                column: sessionConstants.CASE_LISTING_COLUMN_ONE,
                caseNumber,
                sessionDuration: sessionConstants.CASE_LISTING_SESSION_DURATION_1_00,
                hearingType: sessionConstants.CASE_LISTING_HEARING_TYPE_APPLICATION,
                cancelReason: sessionConstants.CASE_LISTING_CANCEL_REASON_AMEND,
                sessionStatus: sessionConstants.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
                sessionJoh: sessionConstants.AUTO_JUDICIAL_OFFICE_HOLDER_02,
            },
        );
    }


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
      sessionJoh: string;
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
      roomData.sessionDuration,
      roomData.sessionStatus,
      roomData.sessionJoh,
    );

    await expect(
      hearingSchedulePage.confirmListingReleasedStatus,
    ).toBeVisible();
  }

  // reusable case creation function

  async function createNewCase(
      pages: {
    page: Page;
    loginPage: LoginPage;
    homePage: HomePage;
    addNewCasePage: AddNewCasePage;
    hearingSchedulePage: HearingSchedulePage;
  },
     caseConfig: {
       jurisdiction: string;
       service: string;
       caseType?: string; // made optional for family cases
       region: string;
       cluster: string;
       hearingCentre: string;
       hearingTypeRef: string;
       currentStatus: string;
       }): Promise<{ caseNumber: string; caseName: string }> {
    const { page, loginPage, homePage, addNewCasePage, hearingSchedulePage } =
      pages;

    // Login
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser);

    // Empty cart if there is anything present
    await hearingSchedulePage.sidebarComponent.emptyCaseCart();

    // Navigate to Add New Case page
    await homePage.sidebarComponent.openAddNewCasePage();

    // Generate case details (same as global setup)
    const caseNumber = "HMCTS_CN_" + crypto.randomUUID().toUpperCase();
    const caseName = "AUTO_" + crypto.randomUUID().toUpperCase();

    const caseData = {
      hmctsCaseNumberHeaderValue:
        addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
      caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,

      jurisdiction: caseConfig.jurisdiction,
      service: caseConfig.service,
        caseType: caseConfig.caseType,
      region: caseConfig.region,
      cluster: caseConfig.cluster,
      hearingCentre: caseConfig.hearingCentre,
      hearingTypeRef: caseConfig.hearingTypeRef,
      currentStatus: caseConfig.currentStatus,
    };

    // Create the new case
    await addNewCasePage.addNewCaseWithMandatoryData(
      caseData,
      caseNumber,
      caseName,
    );

    // Return values so each test has its own case
    return { caseNumber, caseName };
  }
});
