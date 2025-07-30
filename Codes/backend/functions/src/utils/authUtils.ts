import { getAuth } from 'firebase-admin/auth';

// Check if email exists in Firebase Auth
export async function emailExists(email: string): Promise<boolean> {
  try {
    await getAuth().getUserByEmail(email);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') return false;
    throw error; // Re-throw other errors
  }
}

// Check if phone number exists in Firebase Auth
export async function phoneExists(phone: string): Promise<boolean> {
  try {
    await getAuth().getUserByPhoneNumber(phone);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') return false;
    throw error; // Re-throw other errors
  }
}
