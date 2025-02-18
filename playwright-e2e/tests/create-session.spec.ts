import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Session creation @create-session", () => {
  // These tests should be run serially to avoid conflicts
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto(config.urls.baseUrl);
  });

  // TODO: is there an API we can clear down sessions with?
  test("Create session using an existing case @smoke @this", async ({
    homePage,
    hearingSchedulePage,
    caseSearchPage,
    caseDetailsPage,
    bookSessionPage,
  }) => {
    // Test data for the test
    const data = {
      roomName: "Leicester County Courtroom 07",
      column: "columnOne",
      caseNumber: "AUTOTESTING001",
      sessionDuration: "1:00",
      hearingType: "Application",
      cancelReason: "Amend",
    };

    // Add case to cart
    await homePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(data.caseNumber);
    await caseDetailsPage.addToCartButton.click();

    // Choose a slot to schedule the hearing
    await expect(hearingSchedulePage.sidebarComponent.sidebar).toBeVisible();
    await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
    await hearingSchedulePage.waitForNavigation();
    await hearingSchedulePage.scheduleHearingWithBasket(
      data.roomName,
      data.column,
      data.caseNumber
    );
    await bookSessionPage.bookSession(data.sessionDuration, data.hearingType);
    // Verify the session is present on the calendar
    const row = await hearingSchedulePage.filterTableByRoom(data.roomName);
    expect(
      await row.row.locator(hearingSchedulePage.siblingRow).textContent()
    ).toContain(data.caseNumber);

    // Remove the session
    await homePage.sidebarComponent.openSearchCasePage();
    await caseSearchPage.searchCase(data.caseNumber);
    await caseDetailsPage.openListingDetails.click();
    await bookSessionPage.cancelSession(data.cancelReason);
    const rowAfterCancel = await hearingSchedulePage.filterTableByRoom(
      data.roomName
    );
    expect(
      await rowAfterCancel.row
        .locator(hearingSchedulePage.siblingRow)
        .textContent()
    ).not.toContain(data.caseNumber);
  });
});
