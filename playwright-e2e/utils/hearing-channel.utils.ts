import { expect } from "@playwright/test";

export class HearingPlatformUtils {
    private static normalizeToken(value: string): string {
        const normalized = value.replace(/\s+/g, " ").trim().toLowerCase();

        if (normalized.includes("on the papers")) return "on the papers";
        if (normalized.includes("in person")) return "in person";
        if (normalized.includes("video")) return "video";
        if (normalized.includes("telephone")) return "telephone";

        return normalized;
    }

    private static extractTokens(value: string): string[] {
        return value
            .split(/[\n,]/)
            .map((token) => token.trim())
            .filter(Boolean)
            .map((token) => this.normalizeToken(token));
    }

    static assertHearingPlatform(
        actualValue: string,
        expectedValue: string | string[],
    ): void {
        const actualTokens = this.extractTokens(actualValue).sort();

        const expectedTokens = Array.isArray(expectedValue)
            ? expectedValue.map((value) => this.normalizeToken(value)).sort()
            : this.extractTokens(expectedValue).sort();

        expect(actualTokens).toEqual(expectedTokens);
    }
}