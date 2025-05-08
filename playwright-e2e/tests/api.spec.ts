import { test } from "../fixtures";
import { HmiUtils } from "../utils/hmi.utils";

test("API @api", async ({}) => {
  const sessions = await HmiUtils.getAllSessions();
  console.log(sessions);
});
