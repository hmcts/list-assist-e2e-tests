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
    const day = String(pastDate.getDate()).padStart(2, '0');
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const year = pastDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Generate a random date of birth in dd/mm/yyyy format
  generateDobInDdMmYyyyDashSeparators(yearsInThePast: number): string {
    const today = new Date();
    const pastDate = new Date(today.setFullYear(today.getFullYear() - yearsInThePast));
    const day = String(pastDate.getDate()).padStart(2, '0');
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const year = pastDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getTodaysDayAsDd(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
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
