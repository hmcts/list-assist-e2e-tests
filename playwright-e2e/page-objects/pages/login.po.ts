import { expect, Page } from "@playwright/test";
import { UserCredentials } from "../../utils";
import { Base } from "../base";

export class LoginPage extends Base {
  readonly logo = this.page.locator("#profile-img");
  readonly usernameInput = this.page.getByLabel("Username");
  readonly passwordInput = this.page.getByLabel("Password");
  readonly submitBtn = this.page.locator('[name="submit"]');

  constructor(page: Page) {
    super(page);
  }

  async login(
    userOrName?: UserCredentials | string,
    disableSaveSession?: boolean,
  ): Promise<void> {
    const user = await this.resolveUser(userOrName);
    await expect
      .poll(
        async () => {
          return await this.usernameInput.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 10_000,
        },
      )
      .toBeTruthy();

    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.submitBtn.click();
    if (disableSaveSession) return;
    await this.saveSession(user);
  }

  private async resolveUser(
    userOrName?: UserCredentials | string,
  ): Promise<UserCredentials> {
    // If nothing provided, use config.users.testUser
    if (!userOrName) {
      const { config } = await import("../../utils/index.js");
      return config.users.testUser;
    }
    // If already a UserCredentials object
    if (
      typeof userOrName === "object" &&
      userOrName.username &&
      userOrName.password
    ) {
      return userOrName;
    }
    // If a string, try to resolve from env
    if (typeof userOrName === "string") {
      const usernameEnv = `USER_${userOrName}`;
      const passwordEnv = `PASSWORD_${userOrName}`;
      const username = process.env[usernameEnv];
      const password = process.env[passwordEnv];
      if (!username || !password) {
        throw new Error(
          `Missing environment variables: ${usernameEnv} or ${passwordEnv}`,
        );
      }
      // Session file path (optional, can be improved)
      const sessionFile = `.sessions/${username}.json`;
      return { username, password, sessionFile };
    }
    throw new Error("Invalid user argument for login");
  }

  private async saveSession(user: UserCredentials) {
    await this.page.context().storageState({ path: user.sessionFile });
  }
}
