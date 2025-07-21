import { expect, test } from "../fixtures";
import { config } from "../utils";

// test.use({
//     storageState: config.users.testUser.sessionFile,
// });

test.describe("Add user @add-user", () => {
  test("Add new user as Listing Officer ", async ({
    addNewCasePage,
    editNewCasePage,
    caseSearchPage,
    dataUtils,
    homePage,
    page,
    loginPage,
    caseDetailsPage,
    automaticBookingDashboardPage,
    createUserPage,
  }) => {
    console.log("I am in......");
    await page.goto(config.urls.baseUrl);
    await loginPage.login(config.users.testUser, true);

    await homePage.sidebarComponent.administrationMenu.click();

    await homePage.sidebarComponent.userMenu.click();
    await page.waitForTimeout(5_000);

    const userLoginId = "AUTO_USER_CD45FE4702974196BDB3E8CA90FB3D2D";

    const searchUserTxt = page.locator("#searchUser");
    await searchUserTxt.fill(userLoginId);

    // user edit button having dynamic id

    const editUserButton = page.locator(`#edit_${userLoginId}`);
    await editUserButton.click();
    await page.locator("#systemDetailsBtn").click();
    await page.waitForTimeout(5_000);

    //region

    const regionsDropdownToggle = page.locator(
      '[aria-owns="systemDetails_secondaryRegistries_listbox"] .multiselect__custom-select',
    );
    await regionsDropdownToggle.click();

    const regionListBox = page.locator(
      "#systemDetails_secondaryRegistries_listbox",
    );

    const walesOption = regionListBox.getByText(
      "Wales Civil, Family and Tribunals",
      { exact: true },
    );
    await walesOption.click();
    await page.locator("text=Resource Management").click();

    //hs localities

    const dropdownToggle = page.locator(
      '[aria-owns="systemDetails_hsLocalities_listbox"] .multiselect__custom-select',
    );
    await dropdownToggle.click();

    const localitiesListbox = page.locator(
      "#systemDetails_hsLocalities_listbox",
    );
    await expect(localitiesListbox).toBeVisible();

    const localityOption = localitiesListbox.getByText("Cardiff Crown Court", {
      exact: true,
    });
    await localityOption.click();
    // await page.keyboard.press('Tab');

    // Click outside the dropdown to trigger selection update
    await page.locator("text=Resource Management").click();

    // securityType dropdown

    const container = page
      .locator('[aria-owns="systemDetails_securityType_listbox"]')
      .locator(".multiselect__select");
    await container.click();

    const listbox = page.locator("#systemDetails_securityType_listbox");
    await expect(listbox).toBeVisible();

    const option = listbox.getByText("Record Keeping", { exact: true });
    await option.click();

    await page.getByRole("heading", { name: "Resource Management" }).click();

    //await page.locator('body').click();
  });
});
