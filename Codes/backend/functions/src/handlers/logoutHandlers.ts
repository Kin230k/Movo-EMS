// src/handlers/authHandlers.ts
import { getAuth } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';

export interface LogoutResult {
  success: true;
}

/**
 * Pure function handler for logout: revokes refresh tokens
 */
export async function logoutHandler(
  data: unknown,
  context: functions.https.CallableContext
): Promise<LogoutResult> {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be signed in to log out'
    );
  }

  const uid = context.auth.uid;
  try {
    await getAuth().revokeRefreshTokens(uid);
    return { success: true };
  } catch (err: any) {
    functions.logger.error('logoutHandler error:', err);
    throw new functions.https.HttpsError(
      'internal',
      err.message || 'Failed to revoke tokens'
    );
  }
}
