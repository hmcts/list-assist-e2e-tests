import {expect, test} from "../../fixtures.ts";
import { config } from "../../utils/index.ts";
import { clearDownSchedule } from "../../utils/reporting.utils.ts";
import * as process from "node:process";



test.describe.only("Multi-day case listing @multi-day", () => {

    test.slow();
    test.describe.configure({ mode: "serial" });

    test("Multi-day case listing and reporting @multi-day", async ({
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
        loginPage
    }) => {

        await test.step('Go to base URL', async () => {
            await page.goto(config.urls.baseUrl);
            await loginPage.login(config.users.testUser);
        });


        await test.step('Search for case and add to cart', async () => {

            await addNewCasePage.sidebarComponent.openSearchCasePage();
            await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);
            //await caseSearchPage.searchCase("HMCTS_CN_A412AB06-2A1B-4C54-8636-26FA0E0D78DB");
            await caseSearchPage.addToCartButton.click();
        });

        await test.step('Open listing requirements and set hearing type', async () => {
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
            await caseDetailsPage.hearingTypeSelect.selectOption(addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF);
            await listingRequirementsPage.multidayHearingHoursTextBox.fill("2");
            await listingRequirementsPage.multidayHearingDaysTextBox.fill("3");
            await caseDetailsPage.saveButton.click();
        });

        await test.step('Open hearing schedule page and set advanced filter', async () => {
            await sessionBookingPage.sidebarComponent.openHearingSchedulePage();
            await sessionBookingPage.updateAdvancedFilterConfig(
                sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_NORTH_EAST,
                sessionBookingPage.CONSTANTS.CASE_LISTING_CLUSTER_CLEVELAND_DURHAM_TEES_VALLEY,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_DARLINGTON_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
            );
        });

        await test.step('Clear down multi-day schedule', async () => {
            await hearingSchedulePage.clearDownMultiDaySchedule(
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
                dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
            );
        });

        await test.step('Create a new session with recurrence', async () => {
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
            await sessionBookingPage.jurisdictionDropdown.selectOption('AB');

            await sessionBookingPage.durationDropdownButton.click();
            await sessionBookingPage.sessionTypeDropdown.click();
            await sessionBookingPage.sessionTypeDropdown.selectOption('ADHOC');


            await sessionBookingPage.selectListingDuration(
                sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
            );
            await hearingSchedulePage.saveButton.click();
        });

        await test.step('Cart all sessions', async () => {
            const cartAllSessionsButton = hearingSchedulePage.page.locator(
                `button[title="Cart all sessions of room: ${sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1}"][aria-label="Cart all sessions of room: ${sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1}"]`,
            );
            await expect(cartAllSessionsButton,'Cart All Sessions button should be visible').toBeVisible();
            await cartAllSessionsButton.click();
        });

        await test.step('Check multi-day cart is populated', async () => {
            await hearingSchedulePage.sidebarComponent.checkMultiDayCartButtonEnabled();
            await hearingSchedulePage.sidebarComponent.checkMultiDayCartNumberIsPresent();
        });

        await test.step('Open multi-day cart and verify contents', async () => {
            await hearingSchedulePage.sidebarComponent.openMultiDayCart();
            await multiDayCartPage.assertMultiDaysCartPageHasLoaded();
            await multiDayCartPage.assertAllLinesInMultiDaysCartTableHaveCorrectLocalityAndLocation(
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCALITY_DARLINGTON_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
            );
        });


        await test.step('Select case and apply filter in multi-day cart', async () => {
            await multiDayCartPage.selectCaseFromSelectDropDown(
                process.env.HMCTS_CASE_NUMBER as string,
            );
            const lrString =
                dataUtils.generateMonthAndYearWithHyphenSeparators() +
                " Application Open";
            await multiDayCartPage.waitForlistingRequirementsSelectionToBePopulated(lrString);
            await multiDayCartPage.waitForlistingRequirementsSelectionToBePopulated(lrString);
            await multiDayCartPage.applyFilterButton.click();

        });


        await test.step('Assert multiday cart durations', async ()=> {
            // await hearingSchedulePage.sidebarComponent.openMultiDayCart();
            // await multiDayCartPage.selectCaseFromSelectDropDown(
            //     process.env.HMCTS_CASE_NUMBER as string,
            // );

            await multiDayCartPage.assertMultiDaysCartPageHasLoaded();
            await multiDayCartPage.assertMultiDayCartDurations({
                listingRequirements: 'Listing requirements:2 hr(s) 03 day(s) 0 week(s)',
                required: 'Required:4 session(s), total duration 17:00',
                listed: 'Listed:0 session(s), total duration 00:00',
                currentlySelected: 'Currently selected:0 session(s), total duration 00:00',
                remainingToAllocate: 'Remaining to allocate:4 session(s), total duration 17:00',
            });
        });


        await test.step('Click Bulk List and submit', async() => {
            await multiDayCartPage.bulkListCheckBox.check();
            await multiDayCartPage.submitButton.click();
        });


        await test.step('Handle multi-day validation popup (commented out as page is broken in 4.67 release)', async () => {
            //click ok on multi-day validation popup
            const pagePromise = multiDayCartPage.page.waitForEvent("popup", {
              timeout: 2000,
            });
            await expect(multiDayCartPage.okbuttonOnValidationPopup, 'Validation popup OK button should be visible').toBeVisible();
            await multiDayCartPage.okbuttonOnValidationPopup.click();

            //listing validation popup
            const validationPopup = await pagePromise;
            await validationPopup.waitForLoadState("domcontentloaded");
            // interacting with validation popup
            await validationPopup
              .getByRole("combobox", { name: "Reason to override rule/s *" })
              .selectOption({
                label:
                  sessionBookingPage.CONSTANTS
                    .CASE_LISTING_VALIDATION_POPUP_OVERRIDE_REASON,
              });
            await validationPopup
              .getByRole("button", { name: "SAVE & CONTINUE LISTING" })
              .click();

            await multiDayCartPage.additionalListingDataPageHeader.isVisible();
            await multiDayCartPage.createListingsOnlyButton.click();

            await hearingSchedulePage.waitForLoad();
        });

        await test.step('Assert 5 listings are present', async () => {
            await expect(hearingSchedulePage.listingSquareIcons, 'Should display 5 square icons for sessions').toHaveCount(5);
        });
    });
});

//////////////helper functions/////////////

async function checkWeekdayRecurringCheckboxes(page) {
    for (const day of [2, 3, 4, 5, 6]) {
        await page.check(`#venueBooking\\.recurringDay${day}`);
    }
}

async function clearDownDarlingtCountCourtSchedule(
    sessionBookingPage,
    hearingSchedulePage,
    dataUtils,
) {
    await clearDownSchedule(
        sessionBookingPage,
        hearingSchedulePage,
        sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_NORTH_EAST,
        sessionBookingPage.CONSTANTS
            .CASE_LISTING_CLUSTER_CLEVELAND_DURHAM_TEES_VALLEY,
        sessionBookingPage.CONSTANTS
            .CASE_LISTING_LOCALITY_DARLINGTON_COUNTY_COURT,
        sessionBookingPage.CONSTANTS
            .CASE_LISTING_LOCATION_DARLINGTON_CRTRM_1,
        sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,

        dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
    );
}

