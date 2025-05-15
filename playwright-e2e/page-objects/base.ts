import { Page } from '@playwright/test';
import { SidebarComponent } from './components';
import { UpperbarComponent } from './components/upperbar.component.ts';

// A base page inherited by pages & components
// common objects and methods can be defined here
export abstract class Base {
  readonly baseContainer = this.page.locator('body');
  readonly sidebarComponent = new SidebarComponent(this.baseContainer, this.page);

  readonly upperbarComponent = new UpperbarComponent(this.baseContainer, this.page);

  constructor(public readonly page: Page) {}
}
