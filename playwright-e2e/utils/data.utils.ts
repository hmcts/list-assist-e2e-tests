export class DataUtils {
  // Generate a random string of alphabetical characters
  generateRandomAlphabetical(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.capitaliseFirstLetter(result);
  }

  // Generate a random string of alphanumeric characters
  generateRandomAlphanumeric(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
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
    const today = new Date();
    const pastDate = new Date(today.setFullYear(today.getFullYear() - yearsInThePast));

    // Format the date as dd/mm/yyyy using toLocaleDateString
    const formattedDate = pastDate.toLocaleDateString('en-GB').replace(/\//g, '/');

    return formattedDate;
  }

  // Generate date in yyyymmdd with no separators
  generateDateInYyyyMmDdNoSeparators(daysFromToday: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);

    const formattedDate = date
      .toLocaleDateString('en-CA') // 'en-CA' formats the date as yyyy-mm-dd
      .replace(/-/g, ''); // remove dashes to get yyyymmdd

    return formattedDate;
  }

  // Generate date in yyyy-mm-dd with hyphen separators
  generateDateInYyyyMmDdWithHypenSeparators(daysFromToday: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);

    const formattedDate = date.toLocaleDateString('en-CA'); // 'en-CA' formats the date as yyyy-mm-dd

    return formattedDate;
  }

  // Gets the number day number in the month, padded with a zero if less than 10.
  // e.g. -1 previous day, 0 today, 1 tomorrow
  getDayAsDd(offset: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const day = String(date.getDate()).padStart(2, '0');
    return day.startsWith('0') ? day.slice(1) : day;
  }

  getCurrentMonthAsString(): string {
    const today = new Date();
    return today.toLocaleString('en-UK', { month: 'long' });
  }

  getFormattedDateForReportAssertion(): string {
    const today = new Date();

    const dayName = today.toLocaleString('en-UK', { weekday: 'long' });
    const day = today.getDate();
    const monthName = today.toLocaleString('en-UK', { month: 'long' });
    const year = today.getFullYear();

    return `${dayName}, ${day} ${monthName} ${year}`;
  }
}
