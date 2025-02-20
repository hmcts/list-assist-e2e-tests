import dotenv from "dotenv";
import * as fs from "fs";
import path from "path";
import { Cookie } from "playwright-core";
import { fileURLToPath } from "url";

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
  if (!fs.existsSync(path)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    const cookie = data.cookies.find(
      (cookie: Cookie) => cookie.name === cookieName
    );

    const oneHourMs = 1 * 60 * 60 * 1000;
    // Using last modified time of the file as the session start time
    const sessionStartTime = fs.statSync(path).mtime.getTime();
    const elapsedTime = Date.now() - sessionStartTime;
    // Converting the cookie value from seconds to ms
    const maxActiveMs = parseInt(cookie.value, 10) * 1000;
    const remainingTime = maxActiveMs - elapsedTime;

    // Session is considered valid if there is >= 1 hour remaining
    return remainingTime > oneHourMs;
  } catch (error) {
    throw new Error(`Could not read session data: ${error} for ${path}`);
  }
}
