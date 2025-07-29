import { getAuth } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';
import { sendEmail } from '../utils/emailService';
import { LoginAlertData } from '../utils/types';

export interface SendLoginAlertResult {
  success: true;
}

export async function sendLoginAlertHandler(
  data: LoginAlertData,
  context: functions.https.CallableContext
): Promise<SendLoginAlertResult> {
  // 1) Ensure the caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  try {
    // 2) Fetch the user record
    const user = await getAuth().getUser(context.auth.uid);
    if (!user.email) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User email missing'
      );
    }

    // 3) Extract device info (if provided)
    const deviceInfo = data.device || 'Unknown device';

    // 4) Send the alert email
    await sendEmail(user.email, 'LOGIN_ALERT', [
      user.displayName || 'User',
      deviceInfo,
    ]);

    return { success: true };
  } catch (err: any) {
    functions.logger.error('Login alert error:', err);

    // 5) Rethrow known HttpsErrors
    if (err instanceof functions.https.HttpsError) {
      throw err;
    }

    // 6) Wrap unknown errors
    throw new functions.https.HttpsError(
      'internal',
      err.message || 'Login notification failed'
    );
  }
}
