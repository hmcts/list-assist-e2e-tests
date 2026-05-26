import { test, expect } from "../../fixtures";
import { config } from "../../utils";
import { clearDownSchedule } from "../../utils/reporting.utils";

test.describe.only("Hearing Schedule - drag and drop @drag-and-drop", () => {
  test("Basic drag and drop", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,
    homePage,
    addNewCasePage,
    caseSearchPage,
    caseDetailsPage,
    dataUtils,
      dragAndDropPo,
  }) => {
    let adjustedOffset = 0;

    await test.step("Open app and sign in", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login();
      adjustedOffset = await dataUtils.getAdjustedOffset(1);
    });

    await test.step("Clear down today and next working day schedules", async () => {
      await clearDownSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARMARTHEN_CC_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
      await clearDownSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARMARTHEN_CC_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(adjustedOffset),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      );
    });

    await test.step("Create and add case to cart", async () => {
      await hearingSchedulePage.sidebarComponent.emptyCaseCart();
      await addNewCasePage.addNewCase(homePage, hearingSchedulePage);
      await caseSearchPage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
      await caseDetailsPage.addToCartButton.click();
      await expect(caseSearchPage.sidebarComponent.cartButton).toBeEnabled();
    });

    await test.step("Open hearing schedule and set advanced filters", async () => {
      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await expect(hearingSchedulePage.header).toBeVisible();
      await sessionBookingPage.updateAdvancedFilterConfig(
        undefined,
        undefined,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARMARTHEN_CC_FC,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
      );
    });

    await test.step(
      "Create released session for next working day from basket",
      async () => {
        await hearingSchedulePage.primaryFilterToggleButton.click();
        await hearingSchedulePage.applyPrimaryDateFilter(
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
        );
        await hearingSchedulePage.waitForLoad();
        await hearingSchedulePage.scheduleHearingWithBasket(
          sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
          sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
          process.env.HMCTS_CASE_NUMBER as string,
        );
        await sessionBookingPage.bookSession(
          sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
          sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
        );
      },
    );

    await test.step(
      "Create released placeholder session for today",
      async () => {
        await hearingSchedulePage.applyPrimaryDateFilter(
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        );
        await hearingSchedulePage.waitForLoad();
        await hearingSchedulePage.page.locator("#roomHS").click();
        await hearingSchedulePage.waitForLoad();

        const table = await hearingSchedulePage.mapTable();
        const row = table.filter(
          (r) =>
            r.roomName ===
            sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
        )[0];

        await row[sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE]
          .locator(hearingSchedulePage.scheduleSelector)
          .click();
        await expect(hearingSchedulePage.schedulePopup.createSession).toBeVisible();
        await hearingSchedulePage.schedulePopup.createSession.click();
        await sessionBookingPage.waitForLoad();
        await sessionBookingPage.jurisdictionDropdown.selectOption({
          value:
            sessionBookingPage.CONSTANTS
              .CASE_LISTING_JURISDICTION_FAMILY_CODE_AB,
        });
        await sessionBookingPage.durationDropdownButton.click();
        await sessionBookingPage.selectListingDuration(
          sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
        );
        await sessionBookingPage.saveButton.click();
        await hearingSchedulePage.waitForLoad();
      },
    );

    await test.step(
      "Filter for two days and verify released sessions in both columns",
      async () => {
          await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
        await hearingSchedulePage.applyPrimaryDateFilter(
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
          dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        );
        await hearingSchedulePage.page.locator("#roomHS").click();
        await hearingSchedulePage.waitForLoad();

        const verifyTable = await hearingSchedulePage.mapTable();
        const carmarthenRow = verifyTable.filter(
          (r) =>
            r.roomName ===
            sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
        )[0];

        await expect(
          carmarthenRow[
            sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE
          ].locator('button[title="Show booking details"] .hs-session-status', {
            hasText: "Released",
          }),
        ).toBeVisible();
        await expect(
          carmarthenRow[
            sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_TWO
          ].locator('button[title="Show booking details"] .hs-session-status', {
            hasText: "Released",
          }),
        ).toBeVisible();

        await hearingSchedulePage.page
          .getByRole("button", {
            name: /Toggle details of all sessions for all rooms/i,
          })
          .click();
        await hearingSchedulePage.waitForLoad();
      },
    );

      await test.step(
          "Drag and drop listing from next day 10:00-11:00 to today slot 13:00-14:00 and verify move",
          async () => {
              const caseName = process.env.CASE_NAME as string;
              console.log("caseName1: ", caseName);

              await dragAndDropPo.dragListingToSlot(
                  caseName,
                  3, // source column
                  2, // target column
                  "13:00-14:00",
              );
          },
      );

      await test.step(
          "Drag and drop listing from today 13:00-14:00 to next day slot 10:00-11:00 and verify move",
          async () => {
              const caseName = process.env.CASE_NAME as string;
              console.log("caseName2: ", caseName);

              await page.waitForTimeout(4000); // Add a short wait to ensure the UI is ready for the next drag and drop action


              await dragAndDropPo.dragListingToSlot(
                  caseName,
                  2, // source column
                  3, // target column
                  "10:00-11:00",
              );
          },
      );

  });

});
