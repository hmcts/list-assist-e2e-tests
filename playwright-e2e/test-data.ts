export class TestData {
  //new data new case creation
  static readonly HMCTS_CASE_NUMBER_HEADER_VALUE = "HMCTS Case Number";
  static readonly CASE_NAME_HEADER_VALUE = "Case Name";
  static readonly JURISDICTION_FAMILY = "Family";
  static readonly SERVICE_DIVORCE = "Divorce";
  static readonly DECREE_ABSOLUTE_CASE_TYPE = "Decree Absolute";
  static readonly REGION_WALES = "Wales";
  static readonly CLUSTER_WALES_CIVIL_FAMILY_TRIBUNALS =
    "Wales Civil, Family and Tribunals";
  static readonly HEARING_CENTRE_CARDIFF =
    "Cardiff Civil and Family Justice Centre";
  static readonly CURRENT_STATUS_AWAITING_LISTING = "Awaiting Listing";

  //hearing type ids
  static readonly HEARING_TYPE_APPLICATION_REF = "449628128";

  //add participant
  static readonly PARTICIPANT_CLASS_PERSON = "PERSON";
  static readonly PARTICIPANT_TYPE_INDIVIDUAL = "IND";
  static readonly PARTICIPANT_GENDER_MALE = "M";
  static readonly PARTICIPANT_INTERPRETER_WELSH = "cym";
  static readonly PARTICIPANT_ROLE_APPLICANT = "APPL";
  static readonly CASE_PARTICIPANT_TABLE_INDIVIDUAL = "Individual";
  static readonly CASE_PARTICIPANT_TABLE_INTERPRETER = "Welsh";

  //case listing
  static readonly CASE_LISTING_ROOM_NAME_LEICESTER_CC_7 =
    "Leicester County Courtroom 07";
  static readonly CASE_LISTING_ROOM_NAME_LEICESTER_CC_8 =
    "Leicester County Courtroom 08";
  static readonly CASE_LISTING_SESSION_STATUS_TYPE_RELEASED = "5";
  static readonly CASE_LISTING_SESSION_STATUS_TYPE_APPROVED = "4";
  static readonly CASE_LISTING_SESSION_DURATION_1_00 = "60";
  static readonly CASE_LISTING_COLUMN_ONE = "columnOne";
  static readonly CASE_LISTING_HEARING_TYPE_APPLICATION = "Application";
  static readonly CASE_LISTING_CANCEL_REASON_AMEND = "Amend";

  //session details
  static readonly SESSION_DETAILS_CANCELLATION_CODE_CANCEL = "CNCL";
}

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
