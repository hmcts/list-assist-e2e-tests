import { test } from "../../fixtures.js";
import { config } from "../../utils/index.js";

process.env.SKIP_CREATE_CASE = "true";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Another example @another-example", () => {
  console.log("This is another example test file.");
});
