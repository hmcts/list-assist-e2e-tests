import { expect } from "@playwright/test";
import { Base } from "../base";

export class DragAndDropPo extends Base {


    getChildDetailsCell(columnIndex: number) {
        return this.page.locator(`#childDetailsList td:nth-child(${columnIndex})`);
    }

    getListingByCaseName(caseName: string) {
        return this.page
            .locator("#childDetailsList div.draggable")
            .filter({ hasText: caseName })
            .first();
    }

    getTargetSlot(columnIndex: number, timeSlot: string) {
        return this.page
            .locator(`#childDetailsList td:nth-child(${columnIndex}) div.droparea`)
            .filter({ hasText: new RegExp(`^${timeSlot}$`) })
            .first();
    }

    async dragListingToSlot(
        caseName: string,
        sourceColumnIndex: number,
        targetColumnIndex: number,
        targetTimeSlot: string,
    ) {
        const sourceListing = this.getListingByCaseName(caseName);
        const sourceCell = this.getChildDetailsCell(sourceColumnIndex);
        const targetCell = this.getChildDetailsCell(targetColumnIndex);
        const targetSlot = this.getTargetSlot(targetColumnIndex, targetTimeSlot);

        await expect(sourceListing).toBeVisible();
        await expect(targetSlot).toBeVisible();

        await expect(sourceCell).toContainText(caseName);
        await expect(targetCell).not.toContainText(caseName);

        await sourceListing.dragTo(targetSlot, {
            targetPosition: { x: 20, y: 10 },
            force: true,
        });

        await expect(this.page.locator("#saveConfirmDragNDropModal")).toBeVisible();
        await this.page.locator("#saveConfirmDragNDropModal").click();

        await expect(this.page.locator("#moveAssistResultModal-modal-1")).toBeVisible();
        await this.page.locator("#moveAssistResultModal-modal-1").click();

        await expect(targetCell).toContainText(caseName);
        await expect(sourceCell).not.toContainText(caseName);
    }

}