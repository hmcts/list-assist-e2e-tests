import { test, expect } from "../fixtures.ts";
import type { NewUiSessionBookingPage } from "../page-objects/pages/hearings/new-ui-session-booking.po.ts";

export async function runSessionBreakFlow(
  newUiSessionBookingPage: NewUiSessionBookingPage,
): Promise<void> {
  await test.step("Assert Breaks section and Add Break button are visible", async () => {
    await expect(newUiSessionBookingPage.breaksLabel).toBeVisible();
    await expect(newUiSessionBookingPage.addBreakButton).toBeVisible();
  });

  await test.step("Add first break 12:00 to 13:00", async () => {
    await newUiSessionBookingPage.addBreakButton.click();
    await newUiSessionBookingPage.setBreakTimes("12:00", "13:00");
    await newUiSessionBookingPage.confirmBreakModal();
  });

  await test.step("Assert Session Booking page reloaded and breaks table is visible", async () => {
    await expect(
      newUiSessionBookingPage.sessionBookingDetailsHeading,
    ).toBeVisible();
    await expect(
      newUiSessionBookingPage.breaksStartTimeHeader.first(),
    ).toBeVisible();
    await expect(
      newUiSessionBookingPage.breaksEndTimeHeader.first(),
    ).toBeVisible();
  });

  await test.step("Verify break row with Start Time 12:00 and End Time 13:00 appears in breaks table", async () => {
    const breakRow = newUiSessionBookingPage.getBreakRowByStartTime("12:00");
    await expect(breakRow).toBeVisible();
    await expect(breakRow).toContainText("13:00");

    await removeBreakAndConfirmYes(newUiSessionBookingPage);
  });

  await test.step("Add second break 14:00 to 15:00", async () => {
    await newUiSessionBookingPage.addBreakButton.click();
    await newUiSessionBookingPage.setBreakTimes("14:00", "15:00");
    await newUiSessionBookingPage.confirmBreakModal();
    await expect(
      newUiSessionBookingPage.getBreakRow("14:00", "15:00"),
    ).toBeVisible();
  });

  await test.step("Edit second break and assert modal is pre-populated", async () => {
    await newUiSessionBookingPage.clickEditBreak("14:00", "15:00");
    await newUiSessionBookingPage.assertBreakModalPrePopulated(
      "14:00",
      "15:00",
    );
  });

  await test.step("Update edited break to 11:00 to 12:00 and confirm", async () => {
    await newUiSessionBookingPage.setBreakTimes("11:00", "12:00");
    await newUiSessionBookingPage.confirmBreakModal();
  });

  await test.step("Assert edited break is updated and old row is no longer shown", async () => {
    await expect(
      newUiSessionBookingPage.getBreakRow("11:00", "12:00"),
    ).toBeVisible();
    await expect(
      newUiSessionBookingPage.getBreakRow("14:00", "15:00"),
    ).not.toBeVisible();
  });

  await test.step("Assert breaks table remains sorted by start time", async () => {
    await newUiSessionBookingPage.assertBreakStartTimesSortedAscending();
  });

  await test.step("Remove all breaks from the session", async () => {
    await removeBreakAndConfirmYes(newUiSessionBookingPage);
  });
}

async function removeBreakAndConfirmYes(
  newUiSessionBookingPage: NewUiSessionBookingPage,
): Promise<void> {
  await newUiSessionBookingPage.removeBreakButton.first().click();
  await expect(
    newUiSessionBookingPage.sessionBreakConfirmationDialogue,
  ).toBeVisible({
    timeout: 5000,
  });
  await expect(
    newUiSessionBookingPage.confirmationDialogueYesButton,
  ).toBeVisible({
    timeout: 5000,
  });
  await newUiSessionBookingPage.confirmationDialogueYesButton.click();
}
