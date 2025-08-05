
import { expect, test } from "../fixtures";
import { config } from "../utils";
import {SessionBookingPage} from "../page-objects/pages/hearings/session-booking.po.ts";
import {
    CaseDetailsPage,
    CaseSearchPage,
    HearingSchedulePage,
    HomePage, LoginPage,
} from "../page-objects/pages";

import { BrowserContext, Page } from '@playwright/test';
import {EditNewCasePage} from "../page-objects/pages/cases/edit-case.po.ts";
import {DataUtils} from "../utils/data.utils.ts";

let context: BrowserContext;
let page: Page;
let sessionBookingPage: SessionBookingPage;
let caseSearchPage: CaseSearchPage;
let caseDetailsPage: CaseDetailsPage;
let hearingSchedulePage: HearingSchedulePage;
let homePage: HomePage;
let loginPage: LoginPage;
let editNewCasePage: EditNewCasePage;
let dataUtils: DataUtils;


test.describe("Daily Cause List Report tests @daily-cause-list-tests", () => {
    test.slow();
    test.describe.configure({ mode: "serial" });

    test.beforeAll(
        async ({ browser }) => {

            context = await browser.newContext();
            page = await context.newPage();

            homePage = new HomePage(page);
            caseSearchPage = new CaseSearchPage(page);
            caseDetailsPage = new CaseDetailsPage(page);
            hearingSchedulePage = new HearingSchedulePage(page);
            sessionBookingPage = new SessionBookingPage(page);
            loginPage = new LoginPage(page);
            editNewCasePage = new EditNewCasePage(page);
            dataUtils = new DataUtils();


            await page.goto(config.urls.baseUrl);
            await loginPage.login(config.users.testUser);

            //empties cart if there is anything present

            await hearingSchedulePage.sidebarComponent.emptyCaseCart();
            //search for the case

            await sessionBookingPage.sidebarComponent.openSearchCasePage();

            //await addNewCasePage.sidebarComponent.openSearchCasePage();
            await caseSearchPage.searchCase(process.env.HMCTS_CASE_NUMBER as string);

            await expect(editNewCasePage.caseNameField).toHaveText(
                process.env.CASE_NAME as string,
            );

            await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

            await sessionBookingPage.updateAdvancedFilterConfig(
                sessionBookingPage.CONSTANTS.CASE_LISTING_REGION_WALES,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS,
                sessionBookingPage.CONSTANTS
                    .CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
            );

            await hearingSchedulePage.clearDownSchedule(
                sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL,
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                dataUtils.generateDateInDdMmYyyyWithHypenSeparators(0),
            );

            //Test data
            const roomData = {
                roomName:
                sessionBookingPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
                column: sessionBookingPage.CONSTANTS.CASE_LISTING_COLUMN_ONE,
                caseNumber: process.env.HMCTS_CASE_NUMBER as string,
                sessionDuration:
                sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
                hearingType:
                sessionBookingPage.CONSTANTS.CASE_LISTING_HEARING_TYPE_APPLICATION,
                cancelReason:
                sessionBookingPage.CONSTANTS.CASE_LISTING_CANCEL_REASON_AMEND,
            };

            await createHearingSession(
                roomData.caseNumber,
                homePage,
                caseSearchPage,
                caseDetailsPage,
                hearingSchedulePage,
                roomData,
                sessionBookingPage,
            );


} );




    test('External hearing list report test', async ({

                                                         viewReportsPage,
                                                         dataUtils,
                                                     }) => {

        const reportData = {
            //numeric, current day of the month
            dateFrom: dataUtils.generateDateInYyyyMmDdNoSeparators(0),
            dateTo: dataUtils.generateDateInYyyyMmDdNoSeparators(1),

            locality:
            viewReportsPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
            location:
            viewReportsPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
            jurisdiction: viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
        };

        //await page.goto('https://trg.list-assist.service.justice.gov.uk/casehqtraining/vue/HomePage/init.action?pageTitle=Home');


        //open reports menu and check generated report
        await viewReportsPage.reportRequestPageActions(
            reportData.dateFrom,
            reportData.locality,
            reportData.location,
            reportData.jurisdiction,
            dataUtils.getFormattedDateForReportAssertion(),

        );



        // await sessionBookingPage.sidebarComponent.openHearingSchedulePage();

    });


    test('internal hearing list report test', async ({
                                                         viewReportsPage,
                                                         dataUtils,
                                                     }) => {



        const reportData = {
            //numeric, current day of the month
            dateFrom: dataUtils.generateDateInYyyyMmDdNoSeparators(0),

            locality:
            viewReportsPage.CONSTANTS.CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT,
            location:
            viewReportsPage.CONSTANTS.CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1,
            jurisdiction: viewReportsPage.CONSTANTS.JURISDICTION_CIVIL,
            service: viewReportsPage.CONSTANTS.SERVICE_DAMAGES,
        };

        //open reports menu and check generated report
        await viewReportsPage.reportRequestPageActions(
            reportData.dateFrom,
            reportData.locality,
            reportData.location,
            reportData.jurisdiction,
            dataUtils.getFormattedDateForReportAssertion(),
            reportData.service,
        );

    });

    async function createHearingSession(
        caseName: string,
        homePage: HomePage,
        caseSearchPage: CaseSearchPage,
        caseDetailsPage: CaseDetailsPage,
        hearingSchedulePage: HearingSchedulePage,
        roomData: {
            roomName: string;
            column: string;
            caseNumber: string;
            sessionDuration: string;
            hearingType: string;
            cancelReason: string;
        },
        sessionBookingPage: SessionBookingPage,
    ) {
        // Check if the close case button in upper bar is present
        await expect(homePage.upperbarComponent.closeCaseButton).toBeVisible();
        //check current case drop down menu in upper bar
        await expect(
            homePage.upperbarComponent.currentCaseDropdownButton,
        ).toBeVisible();
        await homePage.upperbarComponent.currentCaseDropdownButton.click();

        await expect(
            homePage.upperbarComponent.currentCaseDropdownList,
        ).toContainText(homePage.upperbarComponent.currentCaseDropDownItems);

        //add case to cart
        await caseSearchPage.sidebarComponent.openSearchCasePage();
        await caseSearchPage.searchCase(caseName);

        await expect(caseDetailsPage.addToCartButton).toBeVisible();
        await caseDetailsPage.addToCartButton.click();
        await expect(caseDetailsPage.sidebarComponent.cartButton).toBeEnabled();

        //go to hearing schedule page
        await expect(hearingSchedulePage.sidebarComponent.sidebar).toBeVisible();
        await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();

        //schedule hearing
        await hearingSchedulePage.waitForLoad();

        await hearingSchedulePage.scheduleHearingWithBasket(
            roomData.roomName,
            roomData.column,
            roomData.caseNumber,
        );

        //session booking page
        await sessionBookingPage.bookSession(
            sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_DURATION_1_00,
            sessionBookingPage.CONSTANTS.CASE_LISTING_SESSION_STATUS_TYPE_RELEASED,
        );

        //confirm listing
        await expect(
            hearingSchedulePage.confirmListingReleasedStatus,
        ).toBeVisible();
    }

    test.afterAll(async () => {
        await context.close();
    });

});

