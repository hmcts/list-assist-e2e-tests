import { test as setup } from './fixtures';
import { isSessionValid } from './utils';
import fs from 'fs/promises';
import path from 'path';

setup.describe('Global Setup', () => {
  setup.beforeAll(async ({ dataUtils }) => {
    // Update bank holidays file if needed
    dataUtils.updateBankHolidaysFileIfNeeded();
  });

  setup('Remove session file', async () => {
    const sessionsDir = path.resolve(path.dirname(new URL('', import.meta.url).pathname), './.sessions');
    const automationTestSession = path.join(sessionsDir, 'automationtest.json');

    try {
      await fs.unlink(automationTestSession);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error removing automationtest.json:', err);
      }
    }
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
