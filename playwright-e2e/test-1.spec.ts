import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://trg.list-assist.service.justice.gov.uk/casehqtraining/CMSHomeAction.do');
  await page.getByRole('textbox', { name: 'Username' }).fill('automationtest');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('automationtest');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.goto(
    'https://trg.list-assist.service.justice.gov.uk/casehqtraining/vue/HomePage/init.action?pageTitle=Home',
  );
  await page.getByRole('link', { name: 'Cases' }).click();
  await page.locator('#search_subMenuItem').click();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('link', { name: 'HMCTS_CN_MULZNMSSMW' }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Cases' }).click();
  await page.getByRole('link', { name: 'Hearings' }).click();
  await page.getByRole('link', { name: 'Hearing Schedule' }).click();
  await page.getByRole('button', { name: '10:00-16:00 - Released  ' }).click();
  await page.getByRole('button', { name: '10:00-16:00 - Leicester' }).click();
  await page.getByRole('button', { name: 'Go to Session Details screen' }).click();
  await page.locator('#handleListingImgId').nth(1).click();
  await page.locator('#cancellationCode').selectOption('CNCL');
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Add new booking for Leicester County Courtroom 07 on 05-16-' }).click();
  await page.getByRole('link', { name: 'Go to session details page:' }).click();
  await page.getByLabel('Default Listing Duration (').selectOption('60');
  await page.getByRole('button', { name: 'Save' }).click();
  await page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole('button', { name: 'Please Choose...' })
    .click();
  await page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole('list')
    .getByRole('option', { name: 'Allocation Hearing', exact: true })
    .click();
  await page
    .locator('iframe[name="addAssociation"]')
    .contentFrame()
    .getByRole('button', { name: 'Save', exact: true })
    .click();
  await page.goto(
    'https://trg.list-assist.service.justice.gov.uk/casehqtraining/vue/Html5ResourceScheduler/init.action?XSRF-TOKEN=424722bc-fe3b-4b2f-b503-160be0b1598a',
  );
});
