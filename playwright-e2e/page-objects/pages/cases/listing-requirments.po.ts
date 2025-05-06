import { Page } from '@playwright/test';
import { Base } from '../../base';

export class ListingRequirementsPage extends Base {

  readonly CONSTANTS = {
    PARENT_HEARING_CHANNEL_IN_PERSON: 'In Person (parent)',
    PARENT_HEARING_CHANNEL_TELEPHONE: 'Telephone',
    PARENT_HEARING_CHANNEL_VIDEO: 'Video',
  };

  readonly parentHearingChannel = this.page.locator('span').filter({ hasText: 'In Person (parent) Not' }).getByRole('button');

  constructor(page: Page) {
    super(page);
  }

  async setHearingChannel(hearingChannel: string): Promise<void> {
    await this.page.getByRole('checkbox', { name: hearingChannel }).check();
  }

}
