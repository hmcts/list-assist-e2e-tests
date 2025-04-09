//generate a random string of alphabetical characters
export function generateRandomAlphabetical(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return capitaliseFirstLetter(result);
}

//generate a random string of alphanumeric characters
export function generateRandomAlphanumeric(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

//capitalise first letter of a string
function capitaliseFirstLetter(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//generate a random number between 1 and 50
export function getRandomNumberBetween1And50(): number {
  return Math.floor(Math.random() * 50) + 1;
}

//generate a random date of birth in dd/mm/yyyy format
export function generateDobInDdMmYyyy(yearsInThePast: number): string {
  const today = new Date();
  const pastDate = new Date(
    today.setFullYear(today.getFullYear() - yearsInThePast),
  );
  const day = String(pastDate.getDate()).padStart(2, "0");
  const month = String(pastDate.getMonth() + 1).padStart(2, "0");
  const year = pastDate.getFullYear();
  return `${day}/${month}/${year}`;
}
