import { LintingConfig } from "@hmcts/playwright-common";
import tseslint from "typescript-eslint";

export default tseslint.config(
  LintingConfig.tseslintRecommended,
  LintingConfig.ignored,
  LintingConfig.tseslintPlugin,
  LintingConfig.playwright
);
