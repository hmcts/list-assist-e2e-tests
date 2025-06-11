import {test} from "../fixtures.js";
import {HmiUtils} from "../utils/hmi.utils.js";
import {config} from "../utils";
import {expect} from "@playwright/test";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("HMI Amend API tests before listing @Amend-Api-test", () => {
  test("Amended participants and their hearing method should display as expected", async ({
                                                                                            editNewCasePage,
                                                                                            page,
                                                                                            config,
                                                                                            caseSearchPage,
                                                                                            dataUtils,
                                                                                            homePage,
                                                                                            listingRequirementsPage,
                                                                                            caseDetailsPage,
                                                                                          }) => {
    const CASE_ID = "CASE_ID" + dataUtils.generateRandomAlphabetical(10).toUpperCase();
    const CASE_NAME = "CASE_NAME" + dataUtils.generateRandomAlphabetical(10).toUpperCase();

    const payload = config.data.hearingRequest;
    payload["hearingRequest"]["_case"]["caseIdHMCTS"] = CASE_ID;
    payload["hearingRequest"]["_case"]["caseListingRequestId"] = CASE_ID;

    await HmiUtils.requestHearing(payload);
    console.log("\ncase id = " + CASE_ID);

    // Amend request
    const amendPayload = config.data.amendHearingRequest;
    amendPayload["hearingRequest"]["_case"]["caseIdHMCTS"] = CASE_ID;
    amendPayload["hearingRequest"]["_case"]["caseTitle"] = CASE_NAME;

    await HmiUtils.requestAmendHearing(amendPayload, CASE_ID);

    await page.goto(config.urls.baseUrl);

    await homePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCaseByName(CASE_NAME);

    await expect(editNewCasePage.caseNameField).toHaveText(CASE_NAME);
    await caseDetailsPage.listingRequirementLink.click();

    // Assert main hearing channel after amend
    const selectedHearingChannels = await listingRequirementsPage.getSelectedHearingMethods();
    expect(selectedHearingChannels.length).toBe(1);
    expect(selectedHearingChannels).toEqual(["TEL"]);

    // Assert participant hearing methods after amend
    await expect(listingRequirementsPage.participantMethodsLocator).toHaveCount(3);
    await listingRequirementsPage.assertHearingMethodValueAt(0, "VID");
    await listingRequirementsPage.assertHearingMethodValueAt(1, "VID");
    await listingRequirementsPage.assertHearingMethodValueAt(2, "");
  });
});
