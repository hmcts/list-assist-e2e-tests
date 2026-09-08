import { expect, test } from "../../fixtures";
import { config } from "../../utils";
import { clearDownScheduleFromSessionSummary } from "../../utils/cleardown.utils.ts";





test.describe("P&I Civil Reports Regression - Stage 1 @p-and-i-practise", () => {
  test.slow();
  test.describe.configure({ mode: "serial" });

  test("Create four civil cases, add participants, and keep all cases in basket", async ({
    page,
    loginPage,
    hearingSchedulePage,

    caseSearchPage,
    caseDetailsPage,
    editNewCasePage,
    dataUtils,
    newUiSessionBookingPage,
    sessionBookingPage,
    automaticBookingDashboardPage,
    cath,
  }) => {



      const caseNumber = "HMCTS_CN_FB98F149-10F3-4B9D-99CB-144C20AD2419";



    const hearingChannelsByCase: Array<string[] | undefined> = [
      ["In Person"],
      ["In Person", "Video"],
      ["In Person", "Video", "Telephone"],
      undefined,
    ];



    await test.step("Login", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login("MARCUS_HUNTER");
    });







      await test.step(`Add Case to Basket`, async () => {
        await caseSearchPage.sidebarComponent.openSearchCasePage();
        await caseSearchPage.searchCase("HMCTS_CN_FB98F149-10F3-4B9D-99CB-144C20AD2419");
        await caseDetailsPage.addToCartButton.click();
        await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();
      });




    await test.step.skip("Empty Case Basket", async () => {
      await hearingSchedulePage.sidebarComponent.emptyCaseCart();
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

    await test.step(`list Case From Session Summary - Case`, async () => {
      await newUiSessionBookingPage.listCaseFromSessionSummary(
          caseNumber,
          newUiSessionBookingPage.CONSTANTS.HEARING_TYPE_CHAMBERS_OUTCOME,
          hearingChannelsByCase[2],
      );
    });


    

  });
});
