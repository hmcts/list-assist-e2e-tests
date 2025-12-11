import { expect, Page } from "@playwright/test";
import { Base } from "../../base";

export class CaseHistoryPage extends Base {
  readonly CONSTANTS = {
    CASE_HISTORY_EVENT_CODE_FILE_NOTE: "File Note",
    CASE_HISTORY_EVENT_CODE_ALLOCATE: "Allocate",
    CASE_HISTORY_EVENT_CODE_REGISTRATION: "Registration",
    CASE_HISTORY_EVENT_FILE_NOTE: "File Note",
    CASE_HISTORY_EVENT_INITIAL_ALLOCATION: "Initial Allocation",
    CASE_HISTORY_EVENT_REGISTRATION: "Registration",
    CASE_HISTORY_COMMENT_TO_AUTOMATION_TEST: "To - Automation Test",
    CASE_HISTORY_COMMENT_INITIATING_DOCUMENT: "Initiating Document",
  };

  readonly caseHistorySearchBox = this.page.locator(
    'input[type="search"].form-control.form-control-sm',
  );

  readonly eventCodeSortButton = this.page.getByRole("columnheader", {
    name: "Event Code",
  });
  readonly commentsHeaderAsc = this.page.locator(
    "th.cell-pre-text.sorting_asc",
  );
  commentCaseHistoryRow(comment: string) {
    return this.page.locator(`tr:has(td.cell-pre-text:has-text("${comment}"))`);
  }

  allocationRow(type: string) {
    return this.page.locator(`tr:has(td:text("${type}"))`);
  }

  constructor(page: Page) {
    super(page);
  }

  async searchCaseNotesAndAssertVisible(
    searchText: string,
    eventCode: string,
    event: string,
    comments: string,
  ) {
    await this.caseHistorySearchBox.fill(searchText);

    if (
      searchText !== this.CONSTANTS.CASE_HISTORY_EVENT_CODE_ALLOCATE &&
      searchText !== this.CONSTANTS.CASE_HISTORY_EVENT_CODE_REGISTRATION
    ) {
      await expect(this.allocationRow(eventCode)).toBeVisible();
      await expect(this.allocationRow(event)).toBeVisible();
      await expect(this.commentCaseHistoryRow(comments)).toBeVisible();
    } else {
      await expect(this.allocationRow(eventCode)).toBeVisible();
      await expect(this.allocationRow(event)).toBeVisible();
      await expect(this.allocationRow(comments)).toBeVisible();
    }

    await this.caseHistorySearchBox.fill("");
  }
}
