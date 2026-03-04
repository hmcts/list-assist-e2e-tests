import { test as setup } from "./fixtures";
import { isSessionValid } from "./utils";

setup.describe("Global Setup", () => {
  setup("Setup test user", async ({ loginPage, page, config }) => {
    // Test user setup
    const user = config.users.testUser;
    if (!isSessionValid(user.sessionFile, user.cookieName!)) {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
    }
  });

  setup(
    "Create new case",
    async ({
      loginPage,
      config,
      page,
      homePage,
      addNewCasePage,
      hearingSchedulePage,
    }) => {
      setup.skip(process.env.SKIP_CREATE_CASE == "true");

      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);

      // Empties cart if there is anything present
      await hearingSchedulePage.sidebarComponent.emptyCaseCart();

      // Navigate to Add New Case page
      await homePage.sidebarComponent.openAddNewCasePage();

      // Generate case details
      process.env.HMCTS_CASE_NUMBER =
        "HMCTS_CN_" + crypto.randomUUID().toUpperCase();
      process.env.CASE_NAME = "AUTO_" + crypto.randomUUID().toUpperCase();

      const caseData = {
        hmctsCaseNumberHeaderValue:
          addNewCasePage.CONSTANTS.HMCTS_CASE_NUMBER_HEADER_VALUE,
        caseNameHeaderValue: addNewCasePage.CONSTANTS.CASE_NAME_HEADER_VALUE,
        jurisdiction: addNewCasePage.CONSTANTS.JURISDICTION_CIVIL,
        service: addNewCasePage.CONSTANTS.SERVICE_DAMAGES,
        caseType: addNewCasePage.CONSTANTS.CASE_TYPE_SMALL_CLAIMS,
        region: addNewCasePage.CONSTANTS.REGION_WALES,
        hearingCentre: addNewCasePage.CONSTANTS.HEARING_CENTRE_CARDIFF,
        hearingTypeRef: addNewCasePage.CONSTANTS.HEARING_TYPE_APPLICATION_REF,
        currentStatus: addNewCasePage.CONSTANTS.CURRENT_STATUS_AWAITING_LISTING,
      };

      // Create the new case
      await addNewCasePage.addNewCaseWithMandatoryData(
        caseData,
        process.env.HMCTS_CASE_NUMBER,
        process.env.CASE_NAME,
      );
    },
  );

  setup.skip(
    "Clean down JOH users in sessions",
    async ({ loginPage, page, config, hearingSchedulePage, dataUtils }) => {
      setup.skip(process.env.JOH_USERS_REQUIRED == "false");

      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);

      await hearingSchedulePage.sidebarComponent.openHearingSchedulePage();
      await hearingSchedulePage.waitForLoad();
      await page.getByRole("tab", { name: "Judicial Office Holders" }).click();
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.applyPrimaryDateFilter(
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
        dataUtils.generateDateInYyyyMmDdWithHypenSeparators(0),
      );
      await hearingSchedulePage.waitForLoad();
      await page
        .getByRole("group", { name: /locality filter list/i })
        .getByLabel("Clear all selected options")
        .click();
      await hearingSchedulePage.waitForLoad();
      await page
        .getByRole("group", { name: /session type filter list/i })
        .getByLabel("Clear All selected options")
        .click();
      await hearingSchedulePage.waitForLoad();
      await page
        .getByRole("group", { name: /JOH Tier \(Inclusion\) filter/i })
        .getByLabel("Clear All selected options")
        .click();
      await hearingSchedulePage.waitForLoad();
      await page
        .getByRole("group", { name: /JOH \(Inclusion\) filter list/i })
        .getByLabel("Clear all selected options")
        .click();
      await hearingSchedulePage.waitForLoad();
      await page
        .getByLabel("JOH (Inclusion) filter list")
        .getByText("Select an item")
        .click();
      await page
        .getByRole("textbox", { name: "JOH (Inclusion)" })
        .fill("automation");
      await page
        .locator(
          "#primaryFilter_memTypesIn_listbox > li > .multiselect__option > .multiselect__options-container > .multiselect__options-checkmark",
        )
        .first()
        .click();
      await hearingSchedulePage.waitForLoad();
      await hearingSchedulePage.waitForLoad();
      await page.getByRole("button", { name: "Apply filter criteria" }).click();
      await hearingSchedulePage.waitForLoad();

      await page.waitForTimeout(5000);
      const bookingCell = page.locator("div.droparea.addBooking");
      const parentRow = bookingCell.locator("..").locator(".."); // div > td > tr
      const releasedCell = parentRow.locator("td", { hasText: "Released" });

      if ((await releasedCell.count()) > 0) {
        const cellText = await releasedCell.first().textContent();
        if (cellText && cellText.includes("Released")) {
          await page.click('button.btn.p-0[title="Expand"]');
          await page.click(
            'div.droparea[role="button"], div.droparea[tabindex="0"]',
          );
          await hearingSchedulePage.deleteSessionInstance();
        } else {
          return;
        }
      } else {
        return;
      }

      // const releasedCell = page.locator('td', { hasText: 'Released' });
      // if (await releasedCell.first().isVisible()) {
      //   await page.click('button.btn.p-0[title="Expand"]');

      //   // Find and click the first .draggable element containing 'HMCTS_CN_'
      //   const draggableExists = await page.$('.draggable');
      //   if (draggableExists) {
      //     await page.evaluate(() => {
      //       const cells = Array.from(document.querySelectorAll('.draggable'));
      //       const target = cells.find(cell => cell.textContent?.includes('HMCTS_CN_'));
      //       if (target) (target as HTMLElement).click();
      //     });
      //   }
      //   await hearingSchedulePage.deleteSessionInstance(sessionBookingPage.CONSTANTS.SESSION_DETAILS_CANCELLATION_CODE_CANCEL);
      // } else {
      //   return;
      // }
    },
  );
});
