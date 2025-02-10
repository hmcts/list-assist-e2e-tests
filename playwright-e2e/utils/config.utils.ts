import dotenv from "dotenv";
import * as fs from "fs";
import path from "path";
import { Cookie } from "playwright-core";
import { fileURLToPath } from "url";

// This needs to be placed somewhere before attempting to access any environment variables
dotenv.config();

export interface UserCredentials {
  username: string;
  password: string;
  sessionFile: string;
  cookieName?: string;
}

interface Urls {
  baseUrl: string;
}

export interface Config {
  users: {
    testUser: UserCredentials;
  };
  urls: Urls;
}

export const config: Config = {
  users: {
    testUser: {
      username: getEnvVar("TEST_USERNAME"),
      password: getEnvVar("TEST_PASSWORD"),
      sessionFile:
        path.join(fileURLToPath(import.meta.url), "../../.sessions/") +
        `${getEnvVar("TEST_USERNAME")}.json`,
      cookieName: "MAX-ACTIVE",
    },
  },
  urls: {
    baseUrl: process.env.BASE_URL as string,
  },
};

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Error: ${name} environment variable is not set`);
  }
  return value;
}

export function getCookies(filepath: string) {
  const data = fs.readFileSync(filepath, "utf8");
  return JSON.parse(data).cookies;
}

export function isSessionValid(path: string, cookieName: string): boolean {
  // consider the cookie valid if there's at least 2 hours left on the session
  const expiryTime = 2 * 60 * 60 * 1000;

  // In the case the file doesn't exist, it should attempt to login
  if (!fs.existsSync(path)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    const cookie = data.cookies.find(
      (cookie: Cookie) => cookie.name === cookieName
    );
    const expiry = new Date(cookie.expires * 1000);
    return expiry.getTime() - Date.now() > expiryTime;
  } catch (error) {
    throw new Error(`Could not read session data: ${error} for ${path}`);
  }
}
