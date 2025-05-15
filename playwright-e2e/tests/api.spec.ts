import { test } from "../fixtures.js";
import { HmiUtils } from "../utils/hmi.utils.js";

test("API @api", async ({ config }) => {
  const payload = config.data.hearingRequest;
  console.log(payload);
  const sessions = await HmiUtils.requestHearing(payload);
  console.log(sessions);
});
