import { getAuth } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';
import { sendEmail } from '../utils/emailService';
import { PasswordResetData } from '../utils/types';

export interface SendPasswordResetResult {
  success: true;
}

export async function sendPasswordResetHandler(
  data: PasswordResetData,
  context: functions.https.CallableContext
): Promise<SendPasswordResetResult> {
  // 1) Validate input
  if (!data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email required');
  }

  try {
    // 2) Generate password reset link
    const link = await getAuth().generatePasswordResetLink(data.email);

    // 3) Send the reset email
    await sendEmail(data.email, 'PASSWORD_RESET', ['User', link]);

    return { success: true };
  } catch (error: any) {
    // 4) Log and rethrow
    functions.logger.error('Password reset error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send password reset email'
    );
  }
}
