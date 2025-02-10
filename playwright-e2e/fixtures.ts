import { test as baseTest } from "@playwright/test";
import { PageFixtures, pageFixtures } from "./page-objects/pages";
import { UtilsFixtures, utilsFixtures } from "./utils";

export type CustomFixtures = PageFixtures & UtilsFixtures;

export const test = baseTest.extend<CustomFixtures, { lighthousePort: number }>(
  {
    ...pageFixtures,
    ...utilsFixtures,
  }
);

export const expect = test.expect;
