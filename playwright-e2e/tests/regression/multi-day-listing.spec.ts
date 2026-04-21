import { expect, test } from "../../fixtures.ts";
import { config } from "../../utils/index.ts";

test.describe("Multi-day case listing @multi-day", () => {
  test.describe.configure({ mode: "serial" });

  test.afterEach(async ({
    hearingSchedulePage,
    sessionBookingPage,
  }) => {
    await sessionBookingPage.sidebarComponent.openHearingSchedulePage();
      await sessionBookingPage.updateAdvancedFilterConfig(
        undefined,
        undefined,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_DARLINGTON_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
      );
    await hearingSchedulePage.clearDownMultiDaySchedule(
      sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
    );
  });

  test("Multi-day case listing @multi-day", async ({
    addNewCasePage,
    caseSearchPage,
    editNewCasePage,
    caseDetailsPage,
    listingRequirementsPage,
    sessionBookingPage,
    hearingSchedulePage,
    multiDayCartPage,
    dataUtils,
    page,
    loginPage,
  }) => {
    await test.step("Go to base URL", async () => {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
    });

    await test.step("Search for case and add to cart", async () => {
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
      await caseSearchPage.addToCartButton.click();
    });

    await test.step("Open listing requirements and set hearing type", async () => {
      console.log("Opening listing requirements page...");
      console.log(process.env.HMCTS_CASE_NUMBER); // Log the case number to ensure it's being read correctly
      await editNewCasePage.sidebarComponent.openListingRequirementsPage();
      await expect
        .poll(
          async () => {
            return await caseDetailsPage.listingRequirementsHeader.isVisible();
          },
          {
            intervals: [2_000],
            timeout: 60_000,
          },
        )
        .toBeTruthy();
      await expect(caseDetailsPage.listingRequirementsHeader).toBeVisible();
      await caseDetailsPage.hearingTypeSelect.selectOption(
        addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
      );
      await listingRequirementsPage.multidayHearingHoursTextBox.fill("2");
      await listingRequirementsPage.multidayHearingDaysTextBox.fill("3");
      await caseDetailsPage.saveButton.click();
    });

    await test.step("Open hearing schedule page and set advanced filter", async () => {
      await sessionBookingPage.sidebarComponent.openHearingSchedulePage();
      await sessionBookingPage.updateAdvancedFilterConfig(
        undefined,
        undefined,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_DARLINGTON_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
      );
    });

    await test.step("Clear down multi-day schedule", async () => {
      await hearingSchedulePage.clearDownMultiDaySchedule(
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
      );
    });

    await test.step("Create a new session with recurrence", async () => {
      await hearingSchedulePage.addBookingButton.click();
      await hearingSchedulePage.createSessionButton.click();
      await expect(hearingSchedulePage.recurranceCheckbox).toBeVisible();
      await hearingSchedulePage.recurranceCheckbox.check();
      await checkWeekdayRecurringCheckboxes(hearingSchedulePage.page);
      await hearingSchedulePage.recurranceWeeksTextbox.fill("1");
      await hearingSchedulePage.recurranceDateUntilTextBox.fill(
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(6),
      );
      await sessionBookingPage.jurisdictionDropdown.click();
      await sessionBookingPage.jurisdictionDropdown.selectOption("AB");

      await sessionBookingPage.durationDropdownButton.click();
      await sessionBookingPage.sessionTypeDropdown.click();
      await sessionBookingPage.sessionTypeDropdown.selectOption("ADHOC");

      await sessionBookingPage.selectListingDuration(
        sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
      );
      await hearingSchedulePage.saveButton.click();
    });

    await test.step("Cart all sessions", async () => {
      await hearingSchedulePage.clickCartAllSessions(
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
      );
    });

    await test.step("Check multi-day cart is populated", async () => {
      await hearingSchedulePage.sidebarComponent.checkMultiDayCartButtonEnabled();
      await hearingSchedulePage.sidebarComponent.checkMultiDayCartNumberIsPresent();
    });

    await test.step("Open multi-day cart and verify contents", async () => {
      await hearingSchedulePage.sidebarComponent.openMultiDayCart();
      await multiDayCartPage.assertMultiDaysCartPageHasLoaded();
      await multiDayCartPage.assertAllLinesInMultiDaysCartTableHaveCorrectLocalityAndLocation(
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_LOCALITY_DARLINGTON_COUNTY_COURT,
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
      );
    });

    await test.step("Select case and apply filter in multi-day cart", async () => {
      await multiDayCartPage.selectCaseFromSelectDropDown(
        process.env.HMCTS_CASE_NUMBER as string,
      );
      const lrString =
        dataUtils.generateMonthAndYearWithHyphenSeparators() +
        " Application Open";
      await multiDayCartPage.waitForlistingRequirementsSelectionToBePopulated(
        lrString,
      );
      await multiDayCartPage.waitForlistingRequirementsSelectionToBePopulated(
        lrString,
      );
      await multiDayCartPage.applyFilterButton.click();
    });

    await test.step("Assert multiday cart durations", async () => {
      await multiDayCartPage.assertMultiDaysCartPageHasLoaded();
      await multiDayCartPage.assertMultiDayCartDurations({
        listingRequirements: "Listing requirements:2 hr(s) 03 day(s) 0 week(s)",
        required: "Required:4 session(s), total duration 17:00",
        listed: "Listed:0 session(s), total duration 00:00",
        currentlySelected:
          "Currently selected:0 session(s), total duration 00:00",
        remainingToAllocate:
          "Remaining to allocate:4 session(s), total duration 17:00",
      });
    });

    await test.step("Click Bulk List and submit", async () => {
      await multiDayCartPage.bulkListCheckBox.check();
      await multiDayCartPage.submitButton.click();
    });

    await test.step("Handle multi-day validation popup", async () => {
      //click ok on multi-day validation popup
      const pagePromise = multiDayCartPage.page.waitForEvent("popup", {
        timeout: 3000,
      });
      await expect(
        multiDayCartPage.okbuttonOnValidationPopup,
        "Validation popup OK button should be visible",
      ).toBeVisible();
      await multiDayCartPage.okbuttonOnValidationPopup.click();
      //listing validation popup
      const validationPopup = await pagePromise;
      await multiDayCartPage.handleListingValidationPopup(
        validationPopup,
        sessionBookingPage.CONSTANTS
          .CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON,
      );
      await multiDayCartPage.additionalListingDataPageHeader.isVisible();
      await multiDayCartPage.createListingsOnlyButton.click();
      await hearingSchedulePage.waitForLoad();
    });

    await test.step("Assert 5 listings are present", async () => {
      await expect(
        hearingSchedulePage.listingSquareIcons,
        "Should display 5 square icons for sessions",
      ).toHaveCount(5);
    });

    await test.step("Cancel 2 listings and assert multiday cart durations", async () => {
      await expect(sessionBookingPage.sidebarComponent.sidebar).toBeVisible();
      await sessionBookingPage.sidebarComponent.openHearingSchedulePage();
      const scheduleButton = await hearingSchedulePage.bookingSessionId(
        sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
        page,
      );
      await scheduleButton.click();
      await hearingSchedulePage.multiDayLink.click();

      // Wait for the section or table to be visible if needed
      await expect(hearingSchedulePage.multiDayEditTable).toBeVisible();
      await expect(multiDayCartPage.cancelFlag1).toBeVisible();
      await multiDayCartPage.cancelFlag1.click();
      await expect(multiDayCartPage.cancelFlag2).toBeVisible();
      await multiDayCartPage.cancelFlag2.click();
      await multiDayCartPage.cancelListingsButton.click();
      await expect(hearingSchedulePage.confirmationCanxAdv).toBeVisible();
      await hearingSchedulePage.confirmationCanxYesButton.click();
      await expect(
        hearingSchedulePage.cancelRescheduleReasonModel,
      ).toBeVisible();
      await hearingSchedulePage.cancelReasonDropDown.selectOption("CNCL");
      await expect(
        hearingSchedulePage.confirmationCanxAdvConfirm,
      ).toBeAttached();
      await expect(
        hearingSchedulePage.confirmationCanxAdvConfirm,
      ).toBeVisible();
      await expect(
        hearingSchedulePage.confirmationCanxConfirmYesButton,
      ).toBeVisible();
      await hearingSchedulePage.confirmationCanxConfirmYesButton.click();
    });

    await test.step("Assert multiday cart durations for partial listing", async () => {
      await multiDayCartPage.assertMultiDayCartDurations({
        listingRequirements: "Listing requirements:2 hr(s) 03 day(s) 0 week(s)",
        required: "Required:4 session(s), total duration 17:00",
        listed: "Listed:3 session(s), total duration 15:00",
        remainingToAllocate:
          "Remaining to allocate: session(s), total duration 00:00",
      });
    });

    await test.step("Search for case and add to cart", async () => {
      await addNewCasePage.sidebarComponent.openSearchCasePage();
      const okButton = page.locator("#confirmUnsavedChangesPopup");
      await okButton.click();
      await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
      await caseSearchPage.addToCartButton.click();
    });

    await test.step("Open multi-day cart", async () => {
      await hearingSchedulePage.sidebarComponent.openMultiDayCart();
      await multiDayCartPage.assertMultiDaysCartPageHasLoaded();
    });

    await test.step("Select case from dropdown", async () => {
      await page.waitForTimeout(2000); // 2 second wait
      await multiDayCartPage.selectCaseFromSelectDropDown(
        process.env.HMCTS_CASE_NUMBER as string,
      );
      await page.waitForTimeout(2000); // 2 second wait
    });

    await test.step("Wait for listing requirements selection to be populated", async () => {
      const lrString =
        dataUtils.generateMonthAndYearWithHyphenSeparators() +
        " Application Fulfilled";
      console.log("Case number searched: " + lrString);
      await multiDayCartPage.waitForlistingRequirementsSelectionToBePopulated(
        lrString,
      );
      await multiDayCartPage.waitForlistingRequirementsSelectionToBePopulated(
        lrString,
      );
    });

    await test.step("Apply filter and handle OK popup", async () => {
      await multiDayCartPage.applyFilterButton.click();
      const okButton = page.getByRole("button", { name: "OK" });
      await okButton.click();
    });

    await test.step("Assert multi-day cart durations after fulfilled", async () => {
      await multiDayCartPage.assertMultiDayCartDurations({
        listingRequirements: "Listing requirements:2 hr(s) 03 day(s) 0 week(s)",
        required: "Required:4 session(s), total duration 17:00",
        listed: "Listed:3 session(s), total duration 15:00",
        currentlySelected:
          "Currently selected:0 session(s), total duration 00:00",
        remainingToAllocate:
          "Remaining to allocate:1 session(s), total duration 02:00",
      });
    });
  });
});

//////////////helper functions/////////////

async function checkWeekdayRecurringCheckboxes(page) {
  for (const day of [2, 3, 4, 5, 6]) {
    await page.check(`#venueBooking\\.recurringDay${day}`);
  }
}
