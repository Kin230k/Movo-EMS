import { HttpsError } from 'firebase-functions/https';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Validate email format
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate E.164 phone format (e.g., +1234567890)
// Validate phone number in two formats:
// 1. Local (leading 0, total 7–15 digits e.g., 0953726430, 0441234567)
// 2. International E.164 (+<countrycode><number>, e.g., +4915123456789)
export function isValidPhone(phone: string): boolean {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber?.isValid() ?? false;
}

// Helper: Validation Error (400)
export function validationError(message: string): HttpsError {
  return new HttpsError('invalid-argument', message);
}

// Helper: Conflict Error (409)
export function conflictError(message: string): HttpsError {
  return new HttpsError('already-exists', message);
}
