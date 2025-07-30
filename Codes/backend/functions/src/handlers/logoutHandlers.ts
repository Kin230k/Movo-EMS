import { getAuth } from 'firebase-admin/auth';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

export interface LogoutResult {
  success: true;
}

/**
 * Handler for logout: revokes refresh tokens
 */
export async function logoutHandler(
  request: CallableRequest<unknown>
): Promise<LogoutResult> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to log out');
  }

  const uid = request.auth.uid;
  try {
    await getAuth().revokeRefreshTokens(uid);
    return { success: true };
  } catch (err: any) {
    logger.error('logoutHandler error:', err);
    throw new HttpsError('internal', err.message || 'Failed to revoke tokens');
  }
}
