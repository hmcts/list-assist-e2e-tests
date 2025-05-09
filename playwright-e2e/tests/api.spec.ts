import { test } from "../fixtures";
import { HmiUtils } from "../utils/hmi.utils";

test("API @api", async ({}) => {
  const hearingId = "451194357";
  const sessions = await HmiUtils.cancelHearing(hearingId);
  console.log(sessions);
});
