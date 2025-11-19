import { DateTime } from "luxon";

export class DataUtils {
  // Generate a random string of alphabetical characters
  generateRandomAlphabetical(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.capitaliseFirstLetter(result);
  }

  // Generate a random string of alphanumeric characters
  generateRandomAlphanumeric(length: number): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Capitalise the first letter of a string
  capitaliseFirstLetter(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Generate a random number between 1 and 50
  getRandomNumberBetween1And50(): number {
    return Math.floor(Math.random() * 50) + 1;
  }

  // Generate a random date of birth in dd/mm/yyyy format
  generateDobInDdMmYyyyForwardSlashSeparators(yearsInThePast: number): string {
    const dob = DateTime.now().minus({ years: yearsInThePast });
    return dob.toFormat("dd/MM/yyyy");
  }

  // Generate date in yyyymmdd with no separators
  generateDateInYyyyMmDdNoSeparators(daysFromToday: number): string {
    const date = DateTime.now().plus({ days: daysFromToday });
    return date.toFormat("yyyyMMdd");
  }

  // Generate date in yyyy-mm-dd with hyphen separators
  generateDateInYyyyMmDdWithHypenSeparators(daysFromToday: number): string {
    const date = DateTime.now().plus({ days: daysFromToday });
    return date.toFormat("yyyy-MM-dd");
  }

  //generate date in format dd Month yyyy with spaces
  //01 January 2025
  getFormattedDateInFormatDDMonthYYYY(): string {
    // Use luxon to format as '19 November 2025'
    const today = DateTime.now();
    return today.toFormat("d LLLL yyyy");
  }

  // Generate date in DD-MM-YYYY with hyphen separators
  generateDateInDdMmYyyyWithHypenSeparators(daysFromToday: number): string {
    const date = DateTime.now().plus({ days: daysFromToday });
    return date.toFormat("dd-MM-yyyy");
  }

  // Gets the number day number in the month, padded with a zero if less than 10.
  // e.g. -1 previous day, 0 today, 1 tomorrow
  getDayAsDd(offset: number = 0): string {
    const date = DateTime.now().plus({ days: offset });
    return date.toFormat("d");
  }

  getCurrentMonthAsString(): string {
    return DateTime.now().toFormat("LLLL");
  }

  getFormattedDateForReportAssertion(): string {
    // Use luxon to format as 'Tuesday, 29 July 2025'
    const today = DateTime.now();
    return today.toFormat("cccc, d LLLL yyyy");
  }

  getCurrentDateTimeUTC(): string {
    // Use luxon to get UTC ISO string without milliseconds
    return DateTime.utc().toISO({ suppressMilliseconds: true });
  }

  getCurrentDateWithDayMonthYear(): string {
    // Use luxon to format as 'Tuesday 29 July 2025'
    const today = DateTime.now();
    return today.toFormat("cccc dd LLLL yyyy");
  }

  getCurrentTimeInFormatHHMM(): string {
    const now = DateTime.now();
    return now.toFormat("HH:mm");
  }
}
