import { expect, test } from "../fixtures";
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Session creation @create-session", () => {
  // These tests should be run serially to avoid conflicts
  // Parallel is possible, but needs unique data. e.g. different case & different room
  test.describe.configure({ mode: "serial" });

  // Test data
  const data = {
    roomName: "Leicester County Courtroom 07",
    column: "columnOne",
    caseNumber: "AUTOTESTING001",
    sessionDuration: "1:00",
    hearingType: "Application",
    cancelReason: "Amend",
  };

  test.beforeEach(
    async ({
      page,
      homePage,
      caseSearchPage,
      caseDetailsPage,
      bookSessionPage,
      hearingSchedulePage,
    }) => {
      await page.goto(config.urls.baseUrl);
      await homePage.sidebarComponent.openSearchCasePage();
      await caseSearchPage.searchCase(data.caseNumber);

      // TODO: is there an API we can clear down sessions with?
      if (!(await caseDetailsPage.isCaseListed())) {
        // If the case is not listed, add it to cart
        await caseDetailsPage.addToCartButton.click();
      } else {
        // Otherwise, attempt to cancel the session
        await caseDetailsPage.addToCartButton.click();
        await caseDetailsPage.openListingDetails.click();
        await bookSessionPage.cancelSession(data.cancelReason);
        const row = await hearingSchedulePage.filterTableByRoom(data.roomName);
        expect(
          await row.row.locator(hearingSchedulePage.siblingRow).textContent()
        ).not.toContain(data.caseNumber);
      }
    }
  );

  test("Create session using an existing case @smoke", async ({
    hearingSchedulePage,
    bookSessionPage,
  }) => {
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
  });
});
