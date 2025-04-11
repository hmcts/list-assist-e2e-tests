import { Page } from "@playwright/test";
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
    user: UserCredentials,
    disableSaveSession?: boolean
  ): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.submitBtn.click();
    if (disableSaveSession) return;
    await this.saveSession(user);
  }

  private async saveSession(user: UserCredentials) {
    await this.page.context().storageState({ path: user.sessionFile });
  }
}
