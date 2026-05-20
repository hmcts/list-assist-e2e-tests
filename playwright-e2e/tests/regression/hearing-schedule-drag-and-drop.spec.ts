import { test, expect } from "../../fixtures";
import { config } from "../../utils";

test.describe.only
  ("Hearing Schedule - drag and drop @drag-and-drop", () => {
  test("Basic drag and drop", async ({
    page,
    loginPage,
    hearingSchedulePage,
    sessionBookingPage,

    dataUtils,
  }) => {
    await page.goto(config.urls.baseUrl);
    await loginPage.login();

    // Setup offset used by drag-and-drop date filters.
    const adjustedOffset = await dataUtils.getAdjustedOffset(1);

    // Navigate to Hearing Schedule via sidebar
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();

    // Assert that the Hearing Schedule page has loaded
    await expect(hearingSchedulePage.header).toBeVisible();

    // Open Advanced Filters, clear pre-populated filters, set Locality and Location
    await sessionBookingPage.updateAdvancedFilterConfig(
      undefined,
      undefined,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_CARMARTHEN_CC_FC,
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_CARMARTHEN_CRTRM_01,
    );



    // Apply date filter spanning today through next working day
    await hearingSchedulePage.primaryFilterToggleButton.click();
    await hearingSchedulePage.applyPrimaryDateFilter(
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(adjustedOffset),
      dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
    );

    // Switch to Rooms view
    await hearingSchedulePage.page.locator("#roomHS").click();
    await hearingSchedulePage.waitForLoad();

    // Verify both today and next working day columns show Released for Carmarthen room
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
/////////////////////////////////////////////////////////////

      await test.step(
          "Drag and drop listing from left column to right column",
          async () => {
              const listingText =
                  "10:00-11:00 (ALLOC) HMCTS_CN_798447AB-1393-4F64-A4 AUTO_DA14CE8A-32F9-4E9C-85F3-BE2714AA3C6F";

              const todayDate =
                  dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0);

              const nextWorkingDate =
                  dataUtils.generateDateInDdMmYyyyWithHypenSeparators(adjustedOffset);

              const headerTexts =
                  (await hearingSchedulePage.tableHeaders.allTextContents()).map(
                      (text) => text.replace(/\s+/g, " ").trim(),
                  );

              const todayHeaderIndex = headerTexts.findIndex((text) =>
                  text.includes(todayDate),
              );

              const nextWorkingHeaderIndex = headerTexts.findIndex((text) =>
                  text.includes(nextWorkingDate),
              );

              const caseName = "DA14CE8A-32F9-4E9C-85F3-BE2714AA3C6F";

              const sourceListing = page
                  .locator("#childDetailsList div.draggable")
                  .filter({ hasText: caseName })
                  .first();



              const sourceCell = page.locator("#childDetailsList td:nth-child(3)");

              const targetTdIndex = nextWorkingHeaderIndex + 1;

              const targetCell = page.locator("#childDetailsList td:nth-child(2)");





              const targetSlot = page
                  .locator("#childDetailsList td:nth-child(2) div.droparea")
                  .filter({ hasText: /10:00\s*-\s*11:00/ })
                  .first();

              await expect(sourceListing).toBeVisible();
              await expect(targetSlot).toBeVisible();

              // Before drag
              await expect(
                  sourceCell.getByText(listingText),
              ).toBeVisible();

              await expect(
                  targetCell.getByText(listingText),
             ).not.toBeVisible();

              // Drag and drop
              await sourceListing.dragTo(targetSlot, {
                  targetPosition: { x: 20, y: 20 },
                  force: true,
              });

              await page.waitForTimeout(2000);

              await page.locator('#saveConfirmDragNDropModal').click();

              await page.locator('#moveAssistResultModal-modal-1').click();



              await hearingSchedulePage.waitForLoad();


              // After drag
              await expect(
                  targetCell.getByText(listingText),
              ).toBeVisible();

              await expect(
                  sourceCell.getByText(listingText),
              ).toHaveCount(0);
          },
      );




    /////////////////////////////////

    await test.step.skip(
      "Drag and drop listing from next working day to today first slot (10:00 to 11:00)",
      async () => {

          const sourceListing = page.getByText(
              "10:00-11:00 (ALLOC) HMCTS_CN_798447AB-1393-4F64-A4 AUTO_DA14CE8A-32F9-4E9C-85F3-BE2714AA3C6F",
          );

          const targetSlot = page
              .locator('div.droparea')
              .filter({ hasText: /10:00\s*-\s*11:00|10:00-11:00/ })
              .first();

          await sourceListing.dragTo(targetSlot, {
              targetPosition: { x: 20, y: 20 },
              force: true,
          });


          await expect(sourceListing).toBeVisible();
          await expect(targetSlot).toBeVisible();

          await sourceListing.dragTo(targetSlot, { force: true });

          await page.waitForTimeout(2000);

          await page.locator('#saveConfirmDragNDropModal').click();


      },
    );
  });

});
