import { test } from "../fixtures.js";
import { HmiUtils } from "../utils/hmi.utils.js";

// only used for testing
test("API @api", async ({ dataUtils, config }) => {
  const caseNumber =
    "HMCTS_CN_" + dataUtils.generateRandomAlphabetical(10).toUpperCase();
  const payload = config.data.hearingRequest;
  payload["hearingRequest"]["_case"]["caseListingRequestId"] = caseNumber;
  payload["hearingRequest"]["_case"]["caseIdHMCTS"] = caseNumber;
  console.log(payload);
  const sessions = await HmiUtils.requestHearing(payload);
});
