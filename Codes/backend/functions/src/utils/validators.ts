import { HttpsError } from 'firebase-functions/https';

// Validate email format
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate E.164 phone format (e.g., +1234567890)
export function isValidPhone(phone: string): boolean {
  const re = /^\+[1-9]\d{1,14}$/;
  return re.test(phone);
}
// Helper: Validation Error (400)
export function validationError(message: string): HttpsError {
  return new HttpsError('invalid-argument', message);
}

// Helper: Conflict Error (409)
export function conflictError(message: string): HttpsError {
  return new HttpsError('already-exists', message);
}
