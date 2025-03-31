import { Page } from "@playwright/test";
import { SidebarComponent } from "./components";

// A base page inherited by pages & components
// common objects and methods can be defined here
export abstract class Base {
  readonly baseContainer = this.page.locator("body");
  readonly sidebarComponent = new SidebarComponent(this.baseContainer);

  constructor(public readonly page: Page) {}
}

export function generateRandomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
