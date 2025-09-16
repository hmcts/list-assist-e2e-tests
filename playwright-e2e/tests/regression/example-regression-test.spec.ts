import { test } from "../../fixtures";
import { config } from "../../utils";

test.use({
  storageState: config.users.testUser.sessionFile,
});

test.describe("Example regression test template", () => {
  test("Example regression test @regression-smoke", async ({}) => {
    console.log("this is an example test");
  });
});
