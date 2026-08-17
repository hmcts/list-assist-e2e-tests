import { expect, test } from "../../fixtures";
import { config } from "../../utils";
import { clearDownScheduleFromSessionSummary } from "../../utils/cleardown.utils.ts";

type ParticipantInput = {
  firstName?: string;
  lastName?: string;
  name?: string;
  type: string;
  role: string;
};

type CaseParticipantInput = {
  participantOne: ParticipantInput;
  participantTwo: ParticipantInput;
};

test.describe("P&I Civil Reports Regression - Stage 1 @p-and-i-civil-reports", () => {
  test.slow();
  test.describe.configure({ mode: "serial" });

  test("Create four civil cases, add participants, and keep all cases in basket", async ({
    page,
    loginPage,
    hearingSchedulePage,
    addNewCasePage,
    homePage,
    caseSearchPage,
    caseDetailsPage,
    editNewCasePage,
    dataUtils,
    newUiSessionBookingPage,
    sessionBookingPage,
    automaticBookingDashboardPage,
      cath,
  }) => {
    const createdCases: Array<{ caseNumber: string; caseName: string }> = [];
    const getCreatedCaseNumber = (caseIndex: number): string => {
      const createdCase = createdCases[caseIndex];
      if (!createdCase) {
        throw new Error(`Expected created case at index ${caseIndex}`);
      }
      return createdCase.caseNumber;
    };
    const getCreatedCaseName = (caseIndex: number): string => {
      const createdCase = createdCases[caseIndex];
      if (!createdCase) {
        throw new Error(`Expected created case at index ${caseIndex}`);
      }
      return createdCase.caseName;
    };
    const caseNameSuppression = dataUtils.generateRandomAlphabetical(10);

    const participantsByCase: CaseParticipantInput[] = [
      {
        participantOne: {
          firstName: "case1",
          lastName: "A",
          type: "IND",
          role: "CLAI",
        },
        participantTwo: {
          firstName: "case1",
          lastName: "B",
          type: "IND",
          role: "DEFE",
        },
      },
      {
        participantOne: {
          firstName: "case2",
          lastName: "A",
          type: "IND",
          role: "CLAI",
        },
        participantTwo: {
          firstName: "case2",
          lastName: "B",
          type: "IND",
          role: "DEFE",
        },
      },
      {
        participantOne: {
          firstName: "case3",
          lastName: "A",
          type: "IND",
          role: "CLAI",
        },
        participantTwo: {
          name: "case3-ORG",
          type: "ORG",
          role: "DEFE",
        },
      },
      {
        participantOne: {
          firstName: "case4",
          lastName: "A",
          type: "IND",
          role: "CLAI",
        },
        participantTwo: {
          name: "case4-ORG",
          type: "ORG",
          role: "DEFE",
        },
      },
    ];

    const resolveParticipantClass = (participantType: string) => {
      if (participantType === "IND") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_PERSON;
      }

      if (participantType === "ORG") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_ORGANISATION;
      }

      throw new Error(`Unsupported participant type: ${participantType}`);
    };

    const resolveParticipantType = (participantType: string) => {
      if (participantType === "IND") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_INDIVIDUAL;
      }

      if (participantType === "ORG") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_ORGANISATION;
      }

      throw new Error(`Unsupported participant type: ${participantType}`);
    };

    const resolveParticipantRole = (participantRole: string) => {
      if (participantRole === "APPL") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_APPLICANT;
      }

      if (participantRole === "CLAI") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_CLAIMANT;
      }

      if (participantRole === "DEFE") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_DEFENDANT;
      }

      throw new Error(`Unsupported participant role: ${participantRole}`);
    };

    const createCaseAndAddParticipants = async (
      caseIndex: number,
      caseParticipantInput: CaseParticipantInput,
    ) => {
      let createdCase: { caseNumber: string; caseName: string };

      await test.step(`Create Case ${caseIndex + 1}`, async () => {
        const isCaseTwo = caseIndex === 1;

        createdCase = await addNewCasePage.addNewCase(
          homePage,
          hearingSchedulePage,
          {
            jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
            service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
            caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
            region: addNewCasePage.CONSTANTS.REGION_WALES,
            hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
            caseName: isCaseTwo
              ? `CASE_2_WITH_SUPPRESSION_${crypto.randomUUID().slice(0, 8).toUpperCase()}`
              : undefined,
          },
          false,
        );

        createdCases.push(createdCase);
      });

      await test.step(`Add Participants for Case ${caseIndex + 1}`, async () => {
        await caseSearchPage.sidebarComponent.openSearchCasePage();
        await caseSearchPage.searchCase(createdCase.caseNumber);
        await caseSearchPage.sidebarComponent.openCaseDetailsEditPage();

        await expect(editNewCasePage.caseParticipantsHeader).toBeVisible();

        if (caseIndex === 1) {
          await test.step("Add Case Name Suppression value for Case 2", async () => {
            await editNewCasePage.setCaseNameSuppression(caseNameSuppression);
          });
        }

        const caseParticipants = [
          caseParticipantInput.participantOne,
          caseParticipantInput.participantTwo,
        ];

        for (const participant of caseParticipants) {
          const participantClass = resolveParticipantClass(participant.type);
          const participantType = resolveParticipantType(participant.type);
          const participantRole = resolveParticipantRole(participant.role);

          if (participant.type === "ORG" && !participant.name) {
            throw new Error("Organisation participant requires a name");
          }

          if (
            participant.type === "IND" &&
            (!participant.firstName || !participant.lastName)
          ) {
            throw new Error(
              "Individual participant requires firstName and lastName",
            );
          }

          await editNewCasePage.createNewParticipant(
            participantClass,
            participantType,
            participant.firstName ?? "",
            participant.lastName ?? "",
            editNewCasePage.CONSTANTS.PARTICIPANT_GENDER_MALE,
            dataUtils.generateDobInDdMmYyyyForwardSlashSeparators(
              dataUtils.getRandomNumberBetween1And50(),
            ),
            editNewCasePage.CONSTANTS.PARTICIPANT_INTERPRETER_WELSH,
            participantRole,
            false,
            undefined,
            participant.name,
          );

          const participantDisplayName =
            participant.type === "ORG"
              ? (participant.name as string)
              : `${participant.lastName as string}, ${participant.firstName as string}`;

          const participantTableType =
            participant.type === "ORG"
              ? "Organisation"
              : editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL;

          const interpreterExpectation =
            participant.type === "ORG"
              ? ""
              : editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER;

          await editNewCasePage.checkCaseParticipantTable(
            participantTableType,
            participantDisplayName,
            interpreterExpectation,
          );
        }
      });

      await test.step(`Add Case ${caseIndex + 1} to Basket`, async () => {
        await caseSearchPage.sidebarComponent.openSearchCasePage();
        await caseSearchPage.searchCase(createdCase.caseNumber);
        await caseDetailsPage.addToCartButton.click();
        await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();
      });
    };

    await test.step("Login", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login("MARCUS_HUNTER");
    });

    await test.step("Empty Case Basket", async () => {
      await hearingSchedulePage.sidebarComponent.emptyCaseCart();
    });

    for (const [
      caseIndex,
      caseParticipantInput,
    ] of participantsByCase.entries()) {
      await createCaseAndAddParticipants(caseIndex, caseParticipantInput);
    }

    await test.step("Verify four cases remain in basket", async () => {
      await expect(caseSearchPage.sidebarComponent.cartCounterLabel).toHaveText(
        "4",
      );
      expect(createdCases).toHaveLength(4);
    });

    await test.step("Clean down schedule for Newport (South Wales) Courtroom 06", async () => {
      await clearDownScheduleFromSessionSummary(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_COURTROOM_06,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
    });

    await test.step("Open app, filter schedule, and open Create Session. UI Validation", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await newUiSessionBookingPage.createSessionWithoutCase(
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_COURTROOM_06,
        sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
        newUiSessionBookingPage.CONSTANTS.SESSION_JURISDICTION_CIVIL,
      );
    });

    await test.step("open session summary", async () => {
      await hearingSchedulePage.openSessionSummaryByLocation(
        "10:00-16:00 - Newport (South Wales) Courtroom 06",
      );
    });

    await test.step("list Case From Session Summary - Case 1", async () => {
      await newUiSessionBookingPage.listCaseFromSessionSummary(
        getCreatedCaseNumber(0),
        newUiSessionBookingPage.CONSTANTS.HEARING_TYPE_CHAMBERS_OUTCOME,
      );
    });

    await test.step("Confirm listing has been created", async () => {
      await expect(
        hearingSchedulePage.confirmListingReleasedStatus,
      ).toBeVisible();
    });

    await test.step("open session summary", async () => {
      await hearingSchedulePage.openSessionSummaryByLocation(
        "10:00-16:00 - Newport (South Wales) Courtroom 06",
      );
    });

    await test.step("list Case From Session Summary - Case 2", async () => {
      await newUiSessionBookingPage.listCaseFromSessionSummary(
        getCreatedCaseNumber(1),
        newUiSessionBookingPage.CONSTANTS.HEARING_TYPE_CHAMBERS_OUTCOME,
      );
    });

    await test.step("Confirm listing has been created", async () => {
      await expect(
        hearingSchedulePage.confirmListingReleasedStatus,
      ).toBeVisible();
    });

    await test.step("open session summary", async () => {
      await hearingSchedulePage.openSessionSummaryByLocation(
        "10:00-16:00 - Newport (South Wales) Courtroom 06",
      );
    });

    await test.step("list  Case From SessionSummary - Case 3", async () => {
      await newUiSessionBookingPage.listCaseFromSessionSummary(
        getCreatedCaseNumber(2),
        newUiSessionBookingPage.CONSTANTS.HEARING_TYPE_CHAMBERS_OUTCOME,
      );
    });

    await test.step("Confirm listing has been created", async () => {
      await expect(
        hearingSchedulePage.confirmListingReleasedStatus,
      ).toBeVisible();
    });

    await test.step("open session summary", async () => {
      await hearingSchedulePage.openSessionSummaryByLocation(
        "10:00-16:00 - Newport (South Wales) Courtroom 06",
      );
    });

    await test.step("listCaseFromSessionSummary - Case 4", async () => {
      await newUiSessionBookingPage.listCaseFromSessionSummary(
        getCreatedCaseNumber(3),
        newUiSessionBookingPage.CONSTANTS.HEARING_TYPE_CHAMBERS_OUTCOME,
      );
    });

    await test.step("Confirm listing has been created", async () => {
      await expect(
        hearingSchedulePage.confirmListingReleasedStatus,
      ).toBeVisible();
    });
    await test.step("generate P&I preview report", async () => {
      await homePage.sidebarComponent.openAutomaticBookingDashboard();
      await expect(
        automaticBookingDashboardPage.autoCreationTasksHeader,
      ).toBeVisible();
      await expect(
        automaticBookingDashboardPage.publishExternalListsCreate,
      ).toBeVisible();
      await automaticBookingDashboardPage.publishExternalListsCreate.click();

      await automaticBookingDashboardPage.populateCreatePublishExternalListsForm(
        automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_REGION_WALES,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_COURTROOM_06,

        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_JURISDICTION_CIVIL,
        automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_SERVICE_DAMAGES,
        automaticBookingDashboardPage.CONSTANTS
          .AUTO_CREATION_DAILY_CIVIL_CAUSE_LIST_SSRS,
        automaticBookingDashboardPage.CONSTANTS.AUTO_CREATION_VERSION_TYPE,
      );
    });

    await test.step("Assert preview report", async () => {
      await automaticBookingDashboardPage.assertPreviewReportValues(
        "In The County Court and The Family Court at Newport (Gwent)",
        "Clarence House, Clarence Place, Newport, NP19 7AA",
        dataUtils.getFormattedDateForReportAssertionUsingDateStringWithDayName(),
        "DAILY CIVIL CAUSE LIST",
        "Newport (South Wales) Courtroom 06",
        [
          {
            time: "10:00 AM",
            caseId: getCreatedCaseNumber(0),
            partyName: getCreatedCaseName(0),
            hearingType: "Chambers Outcome",
            duration: "1 hour",
          },
          {
            time: "11:00 AM",
            caseId: getCreatedCaseNumber(1),
            partyName: caseNameSuppression,
            hearingType: "Chambers Outcome",
            duration: "1 hour",
          },
          {
            time: "12:00 PM",
            caseId: getCreatedCaseNumber(2),
            partyName: getCreatedCaseName(2),
            hearingType: "Chambers Outcome",
            duration: "1 hour",
          },
          {
            time: "1:00 PM",
            caseId: getCreatedCaseNumber(3),
            partyName: getCreatedCaseName(3),
            hearingType: "Chambers Outcome",
            duration: "1 hour",
          },
        ],
      );

    });

    await test.step("check report is queued with no error", async () => {

      let jobRun = "false";

      //assert publish button is now visible
      //click publish button, dismissing any duplicate confirmation dialog
      await automaticBookingDashboardPage.clickPublishAndDismissConfirmation();
      //wait for 'Previous Publish External List header' to be visible
      await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
      //checks that report is queued
      await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
          jobRun,
          // automaticBookingDashboardPage.CONSTANTS
          //     .AUTO_CREATION_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,

          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,


          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
      );
      //closes the publishing external list popup
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

      //checks that report has now been removed from queue
      await automaticBookingDashboardPage.sidebarComponent.openAutomaticBookingDashboard();
      await automaticBookingDashboardPage.publishExternalListsView.click();
      //wait for 'Previous Publish External List header' to be visible
      await automaticBookingDashboardPage.waitForPublishExternalListRunsToBeVisible();
      await automaticBookingDashboardPage.assertPreviousPublishExternalListRunsTable(
          jobRun,
          sessionBookingPage.CONSTANTS
              .CASE_LISTING_LOCALITY_NEWPORT_SOUTH_WALES_CC_FC,

          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(1),
      );

  });

    await test.step("Assert PIP Civil English report", async () => {

      //check for report via CATH UI
      const cathUrl = await cath.cathUrlConstruction(
          cath.CONSTANTS.CATH_TEST_URL,
          cath.CONSTANTS.LOCATION_ID_NEWPORT_SOUTH_WALES_CC_FC,
      );

      const reportName = `${cath.CONSTANTS.LIST_CIVIL_DAILY_CAUSE_LIST} ${dataUtils.getFormattedDateInFormatDDMonthYYYY()} - English (Saesneg)`;

      await cath.assertCivilPipReportValues(
          cathUrl,
          reportName,
          "Newport (South Wales) County Court and Family Court",
          "Clarence House, Clarence Place, Newport",
          "Newport (South Wales) Courtroom 06",
          [
            {
              time: "10am",
              caseId: getCreatedCaseNumber(0),
              caseName: getCreatedCaseName(0),
              caseType: "Small Claims",
              hearingType: "Chambers Outcome",
              duration: "1 hour",
            },
            {
              time: "11am",
              caseId: getCreatedCaseNumber(1),
              caseName: caseNameSuppression,
              caseType: "Small Claims",
              hearingType: "Chambers Outcome",
              duration: "1 hour",
            },
            {
              time: "12pm",
              caseId: getCreatedCaseNumber(2),
              caseName: getCreatedCaseName(2),
              caseType: "Small Claims",
              hearingType: "Chambers Outcome",
              duration: "1 hour",
            },
            {
              time: "1pm",
              caseId: getCreatedCaseNumber(3),
              caseName: getCreatedCaseName(3),
              caseType: "Small Claims",
              hearingType: "Chambers Outcome",
              duration: "1 hour",
            },
          ],
      );
    });

  });
});
