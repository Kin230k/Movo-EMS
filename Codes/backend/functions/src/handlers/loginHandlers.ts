// src/handlers/authHandlers.ts
import { getAuth } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';

export interface LoginData {
  uid: string;
}
export interface LoginResult {
  token: string;
}

/**
 * Pure function handler for login: issues a custom token
 */
export async function loginHandler(
  data: LoginData,
  context: functions.https.CallableContext
): Promise<LoginResult> {
  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'uid is required');
  }

  try {
    const token = await getAuth().createCustomToken(uid);
    return { token };
  } catch (err: any) {
    functions.logger.error('loginHandler error:', err);
    throw new functions.https.HttpsError(
      'internal',
      err.message || 'Failed to create custom token'
    );
  }
}
