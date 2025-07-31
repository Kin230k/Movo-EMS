import { getAuth } from 'firebase-admin/auth';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { sendEmail } from '../utils/emailService';
import { LoginAlertData } from '../../utils/types';

export interface SendLoginAlertResult {
  success: true;
}

export async function sendLoginAlertHandler(
  request: CallableRequest<LoginAlertData>
): Promise<SendLoginAlertResult> {
  // 1) Ensure the caller is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Auth required');
  }

  try {
    // 2) Fetch the user record
    const user = await getAuth().getUser(request.auth.uid);
    if (!user.email) {
      throw new HttpsError('failed-precondition', 'User email missing');
    }

    // 3) Extract device info (if provided)
    const deviceInfo = request.data.device || 'Unknown device';

    // 4) Send the alert email
    await sendEmail(user.email, 'LOGIN_ALERT', [
      user.displayName || 'User',
      deviceInfo,
    ]);

    return { success: true };
  } catch (err: any) {
    logger.error('Login alert error:', err);

    // 5) Rethrow known HttpsErrors
    if (err instanceof HttpsError) {
      throw err;
    }

    // 6) Wrap unknown errors
    throw new HttpsError(
      'internal',
      err.message || 'Login notification failed'
    );
  }
}
