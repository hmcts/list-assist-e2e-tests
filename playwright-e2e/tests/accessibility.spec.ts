import { expect, test } from "../fixtures"; // Import from the centralized fixtures.ts
import { config } from "../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test("Accessibility example using custom fixture @a11y", async ({
  homePage,
  axeUtils,
}) => {
  await expect(homePage.sidebarComponent.sidebarLogo).toBeVisible();
  await axeUtils.audit();
});
