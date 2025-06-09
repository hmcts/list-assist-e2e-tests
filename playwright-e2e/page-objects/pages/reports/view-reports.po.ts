import { Page, expect } from '@playwright/test';
import { Base } from '../../base';

export class ViewReportsPage extends Base {
  readonly CONSTANTS = {
    LOCALITY_LEICESTER_COMBINED_COURT: 'Leicester Combined Court',
    LOCATION_LEICESTER_COUNTY_COURTROOM_07: 'Leicester County Courtroom 07',
    CASE_LISTING_REGION_WALES: 'Wales',
    CASE_LISTING_CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS: 'Wales Civil, Family and Tribunals',
    CASE_LISTING_LOCATION_LEICESTER_CC_7: 'Leicester County Courtroom 07',
    CASE_LISTING_LOCATION_PONTYPRIDD_CRTRM_1: 'Pontypridd Courtroom 01',
    CASE_LISTING_LOCALITY_PONTYPRIDD_COUNTY_COURT: 'Pontypridd County Court and',
    CASE_LISTING_LOCATION_NEWPORT_SOUTH_WALES_CHMBRS_1: 'Newport (South Wales) Chambers 01',
    JURISDICTION_CIVIL: 'Civil',
    SERVICE_DAMAGES: 'Damages',
  };
  //reports menu
  readonly reportsMenu = this.page.locator('#reports_menuItem');
  readonly reportsMenuInternalHearingList = this.page.getByRole('link', { name: 'Opens Internal Hearing List' });

  //reports request page
  readonly viewReportButton = this.page.locator('input#ReportViewerControl_ctl04_ctl00');
  readonly dateFromCalenderSelect = this.page.getByRole('button', { name: 'Date From:' });
  readonly dateFromPicker = this.page.locator('iframe[name="ReportViewerControl_ctl04_ctl03_ctl02"]');
  readonly dateToPicker = this.page.locator('iframe[name="ReportViewerControl_ctl04_ctl03_ctl02"]');
  readonly dateToCalenderSelect = this.page.getByRole('button', { name: 'Date To:' });
  readonly localityDropDown = this.page.getByRole('textbox', { name: 'Locality:' });
  readonly localityChevronButton = this.page.locator('#ReportViewerControl_ctl04_ctl07_ctl01');
  readonly locationDropDown = this.page.getByRole('button', { name: 'Location (Room):' });
  readonly locationChevronButton = this.page.locator('#ReportViewerControl_ctl04_ctl09_ctl01');
  readonly judicialOfficerHolderDropDown = this.page.getByRole('button', { name: 'Judicial Officer Holder:' });
  readonly judicialOfficerHolderDropDownSelectAll = this.page.locator(
    'input#ReportViewerControl_ctl04_ctl11_divDropDown_ctl00[type="checkbox"]',
  );
  readonly judicialOfficerHolderChevronButton = this.page.locator('#ReportViewerControl_ctl04_ctl11_ctl01');
  readonly jurisdictionDropDown = this.page.getByRole('button', { name: 'Jurisdiction:' });
  readonly jurisdictionChevronButton = this.page.locator('#ReportViewerControl_ctl04_ctl13_ctl01');
  readonly serviceDropDown = this.page.getByRole('button', { name: 'Service:' });
  readonly serviceChevronButton = this.page.locator('#ReportViewerControl_ctl04_ctl17_ctl01');

  //report
  readonly reportBody = this.page.locator('div#VisibleReportContentReportViewerControl_ctl09');

  constructor(page: Page) {
    super(page);
  }

  async reportRequestPageActions(
    dateFrom: string,
    dateTo: string,
    locality: string,
    location: string,
    jurisdiction: string,
    service: string,
    reportDate: string,
  ) {
    await expect(this.reportsMenu).toBeVisible();
    await this.reportsMenu.click();
    await expect(this.reportsMenuInternalHearingList).toBeVisible();
    await this.reportsMenuInternalHearingList.click();
    const popup = await this.page.waitForEvent('popup');

    const reportsRequestPage = new ViewReportsPage(popup);
    await expect(reportsRequestPage.viewReportButton).toBeVisible();

    //input to and from dates
    await reportsRequestPage.dateFromCalenderSelect.click();
    await reportsRequestPage.page
      .locator('iframe[name="ReportViewerControl_ctl04_ctl03_ctl02"]')
      .contentFrame()
      .locator(`td.ms-picker-today:has(a[id="${dateFrom}"])`)
      .click();

    await reportsRequestPage.dateToCalenderSelect.click();
    await reportsRequestPage.page
      .locator('iframe[name="ReportViewerControl_ctl04_ctl05_ctl02"]')
      .contentFrame()
      .locator(`td.ms-picker-daycenter:has(a[id="${dateTo}"])`)
      .click();

    //locality drop down select
    const localityDropDownSelect = reportsRequestPage.page.getByRole('checkbox', { name: locality });

    await reportsRequestPage.localityDropDown.click();
    await expect
      .poll(
        async () => {
          await reportsRequestPage.localityDropDown.click();
          return await localityDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await localityDropDownSelect.check();
    await reportsRequestPage.localityChevronButton.click();

    //location drop down select
    const locationDropDownSelect = reportsRequestPage.page.getByRole('checkbox', { name: location });
    await reportsRequestPage.locationChevronButton.isEnabled();
    await expect
      .poll(
        async () => {
          await reportsRequestPage.locationChevronButton.click();
          return await locationDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await locationDropDownSelect.check();
    await reportsRequestPage.locationChevronButton.click();

    //judicial officer holder drop down select
    await expect
      .poll(
        async () => {
          await reportsRequestPage.judicialOfficerHolderChevronButton.isVisible();
          await reportsRequestPage.judicialOfficerHolderChevronButton.click();
          return await reportsRequestPage.judicialOfficerHolderDropDownSelectAll.isVisible;
        },
        {
          intervals: [2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();

    await expect
      .poll(
        async () => {
          await reportsRequestPage.judicialOfficerHolderDropDownSelectAll.check();
          return await reportsRequestPage.judicialOfficerHolderDropDownSelectAll.isChecked;
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    //jurisdiction drop down select
    const jurisdictionDropDownSelect = reportsRequestPage.page.getByRole('checkbox', {
      name: `${jurisdiction}`,
      exact: true,
    });

    await expect
      .poll(
        async () => {
          await reportsRequestPage.jurisdictionChevronButton.isVisible();
          await reportsRequestPage.jurisdictionChevronButton.click();
          return await jurisdictionDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await expect
      .poll(
        async () => {
          await jurisdictionDropDownSelect.check();
          return await jurisdictionDropDownSelect.isChecked;
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await reportsRequestPage.jurisdictionChevronButton.click();

    //service drop down select
    const serviceDropDownSelect = reportsRequestPage.page.getByRole('checkbox', { name: `${service}`, exact: true });

    await expect
      .poll(
        async () => {
          await reportsRequestPage.serviceChevronButton.isVisible();
          await reportsRequestPage.serviceChevronButton.click();
          return await serviceDropDownSelect.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await expect
      .poll(
        async () => {
          await serviceDropDownSelect.check();
          return await serviceDropDownSelect.isChecked;
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await reportsRequestPage.serviceChevronButton.click();
    await expect(reportsRequestPage.viewReportButton).toBeEnabled();
    await reportsRequestPage.viewReportButton.click();

    //assert that report body is generated
    await expect
      .poll(
        async () => {
          return reportsRequestPage.reportBody.isVisible();
        },
        {
          intervals: [2_000],
          timeout: 60_000,
        },
      )
      .toBeTruthy();

    await expect(reportsRequestPage.reportBody).toContainText(locality);
    await expect(reportsRequestPage.reportBody).toContainText('DAILY CAUSE LIST');
    await expect(reportsRequestPage.reportBody).toContainText(reportDate);
  }
}
