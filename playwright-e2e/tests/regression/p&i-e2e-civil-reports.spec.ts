import { expect, test } from "../../fixtures";
import { config } from "../../utils";

type ParticipantInput = {
  firstName: string;
  lastName: string;
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
  }) => {
    const createdCases: Array<{ caseNumber: string; caseName: string }> = [];

    const participantsByCase: CaseParticipantInput[] = [
      {
        participantOne: {
          firstName: "case1",
          lastName: "A",
          type: "IND",
          role: "APPL",
        },
        participantTwo: {
          firstName: "case1",
          lastName: "B",
          type: "IND",
          role: "APPL",
        },
      },
      {
        participantOne: {
          firstName: "case2",
          lastName: "A",
          type: "IND",
          role: "APPL",
        },
        participantTwo: {
          firstName: "case2",
          lastName: "B",
          type: "IND",
          role: "APPL",
        },
      },
      {
        participantOne: {
          firstName: "case3",
          lastName: "A",
          type: "IND",
          role: "APPL",
        },
        participantTwo: {
          firstName: "case3",
          lastName: "B",
          type: "IND",
          role: "APPL",
        },
      },
      {
        participantOne: {
          firstName: "case4",
          lastName: "A",
          type: "IND",
          role: "APPL",
        },
        participantTwo: {
          firstName: "case4",
          lastName: "B",
          type: "IND",
          role: "APPL",
        },
      },
    ];

    const resolveParticipantType = (participantType: string) => {
      if (participantType === "IND") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_TYPE_INDIVIDUAL;
      }

      throw new Error(`Unsupported participant type: ${participantType}`);
    };

    const resolveParticipantRole = (participantRole: string) => {
      if (participantRole === "APPL") {
        return editNewCasePage.CONSTANTS.PARTICIPANT_ROLE_APPLICANT;
      }

      throw new Error(`Unsupported participant role: ${participantRole}`);
    };

    const createCaseAndAddParticipants = async (
      caseIndex: number,
      caseParticipantInput: CaseParticipantInput,
    ) => {
      let createdCase: { caseNumber: string; caseName: string };

      await test.step(`Create Case ${caseIndex + 1}`, async () => {
        createdCase = await addNewCasePage.addNewCase(
          homePage,
          hearingSchedulePage,
          {
            jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
            service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
            caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
            region: addNewCasePage.CONSTANTS.REGION_WALES,
            hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
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

        const caseParticipants = [
          caseParticipantInput.participantOne,
          caseParticipantInput.participantTwo,
        ];

        for (const participant of caseParticipants) {
          await editNewCasePage.createNewParticipant(
            editNewCasePage.CONSTANTS.PARTICIPANT_CLASS_PERSON,
            resolveParticipantType(participant.type),
            participant.firstName,
            participant.lastName,
            editNewCasePage.CONSTANTS.PARTICIPANT_GENDER_MALE,
            dataUtils.generateDobInDdMmYyyyForwardSlashSeparators(
              dataUtils.getRandomNumberBetween1And50(),
            ),
            editNewCasePage.CONSTANTS.PARTICIPANT_INTERPRETER_WELSH,
            resolveParticipantRole(participant.role),
          );

          await editNewCasePage.checkCaseParticipantTable(
            editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INDIVIDUAL,
            `${participant.lastName}, ${participant.firstName}`,
            editNewCasePage.CONSTANTS.CASE_PARTICIPANT_TABLE_INTERPRETER,
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
      await loginPage.login("ISABELLA_WALKER");
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
  });
});
