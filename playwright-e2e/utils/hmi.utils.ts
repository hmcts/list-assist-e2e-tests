import { APIRequestContext, expect, request } from "@playwright/test";
import { config } from "./config.utils.js";

function getHmiApiUrl(): string {
  const env = process.env.TEST_ENV;
  if (env === "SIT") return config.hmi.sitApiUrl;
  if (env === "TRG") return config.hmi.trgApiUrl;
  throw new Error("TEST_ENV must be set to SIT or TRG");
}

export class HmiUtils {
  static async generateOAuthToken(): Promise<string> {
    const requestBody = {
      grant_type: config.hmi.grantType,
      client_id: config.hmi.clientId,
      client_secret: config.hmi.clientSecret,
      scope: config.hmi.scope,
    };

    const apiContext = await request.newContext({
      baseURL: config.hmi.tokenUrl,
    });
    const response = await apiContext.post("", {
      form: requestBody,
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    return "Bearer " + responseBody.access_token;
  }

  static async generateContext(): Promise<APIRequestContext> {
    const context = await request.newContext({
      baseURL: getHmiApiUrl(),
      extraHTTPHeaders: {
        Authorization: await this.generateOAuthToken(),
        "Content-Type": "application/json",
        Accept: "application/json",
        "Source-System": "CFT",
        "Destination-System": "SNL",
        "Request-Created-At": "2020-10-13T20:20:39Z",
        "Request-Processed-At": "2018-01-29 20:36:01",
        "Request-Type": "THEFT",
      },
    });
    return context;
  }

  static async getAllSessions(): Promise<unknown> {
    const context = await this.generateContext();
    const response = await context.get(`/hmi/sessions`);
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  static async requestHearing(payload: unknown): Promise<void> {
    const context = await this.generateContext();
    const response = await context.post(`/hmi/hearings`, { data: payload });
    console.error("Status:", response.status());
    expect(response.ok()).toBeTruthy();
  }

  static async requestAmendHearing(
    payload: unknown,
    caseID: string,
  ): Promise<void> {
    const context = await this.generateContext();
    const response = await context.put(`/hmi/hearings/` + caseID, {
      data: payload,
    });
    console.error("Status:", response.status());
    expect(response.ok()).toBeTruthy();
  }

  static async cancelHearing(hearingId: string): Promise<unknown> {
    const context = await this.generateContext();
    const response = await context.delete(`/hmi/hearings/${hearingId}`);
    expect(response.ok()).toBeTruthy();
    return response.json();
  }
}
