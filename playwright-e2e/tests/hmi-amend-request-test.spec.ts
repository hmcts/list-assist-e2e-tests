import { test } from "../fixtures.js";
import { HmiUtils } from "../utils/hmi.utils.js";
import { config } from "../utils";
import { expect } from "@playwright/test";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("HMI Amend Api tests before listing @Amend-Api-test", () => {

  test("Amended participants and their hearing method should display as expected", async ({
                                                                                            page,
                                                                                            config,
                                                                                            caseSearchPage,
                                                                                            dataUtils,
                                                                                            homePage,
                                                                                            listingRequirementsPage,
                                                                                            caseDetailsPage,
                                                                                          }) => {
    const CASE_ID =
      "CASE_ID" + dataUtils.generateRandomAlphabetical(10).toUpperCase();

    const payload = config.data.hearingRequest;
    payload["hearingRequest"]["_case"]["caseIdHMCTS"] = CASE_ID;
    payload["hearingRequest"]["_case"]["caseListingRequestId"] = CASE_ID;
    await HmiUtils.requestHearing(payload);

    console.log("\ncase id = " + CASE_ID);

    // amend request
    const amendPayload = config.data.amendHearingRequest;
    amendPayload["hearingRequest"]["_case"]["caseIdHMCTS"] = CASE_ID;
    amendPayload["hearingRequest"]["_case"]["caseIdHMCTS"] = CASE_ID;

    await HmiUtils.requestAmendHearing(amendPayload, CASE_ID);

    await page.goto(config.urls.baseUrl);

    await homePage.sidebarComponent.openSearchCasePage();

    await new Promise((resolve) => setTimeout(resolve, 120000)); // 2 minutes wait for amend to show up
    await caseSearchPage.searchCase(CASE_ID);

    await caseDetailsPage.listingRequirementLink.click();

    // asserting main hearing channel after amend
    const selectedHearingChannels =
      await listingRequirementsPage.getSelectedHearingMethods();
    expect(selectedHearingChannels.length).toBe(1);
    expect(selectedHearingChannels).toEqual(["TEL"]);

    // asserting participant hearing methods after amend
    await expect(listingRequirementsPage.participantMethodsLocator).toHaveCount(
      3
    );
    await listingRequirementsPage.assertHearingMethodValueAt(0, "VID");
    await listingRequirementsPage.assertHearingMethodValueAt(1, "VID");
    await listingRequirementsPage.assertHearingMethodValueAt(2, "");
  });
});
