import { test as setup } from './fixtures';
import { isSessionValid } from './utils';

setup.describe('Global Setup', () => {
  setup.beforeAll(async ({ dataUtils }) => {
    // Update bank holidays file if needed
    dataUtils.updateBankHolidaysFileIfNeeded();
  });

  setup('Setup test user', async ({ loginPage, page, config }) => {
    // Test user setup
    const user = config.users.testUser;
    if (!isSessionValid(user.sessionFile, user.cookieName!)) {
      await page.goto(config.urls.baseUrl);
      await loginPage.login(config.users.testUser);
    }
  });
});
