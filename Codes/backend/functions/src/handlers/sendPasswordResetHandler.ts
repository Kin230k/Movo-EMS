import { getAuth } from 'firebase-admin/auth';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { PasswordResetData } from '../utils/types';
import { sendEmail } from '../services/emailService';

export interface SendPasswordResetResult {
  success: true;
}

export async function sendPasswordResetHandler(
  request: CallableRequest<PasswordResetData>
): Promise<SendPasswordResetResult> {
  if (!request.data.email) {
    throw new HttpsError('invalid-argument', 'Email required');
  }

  try {
    const link = await getAuth().generatePasswordResetLink(request.data.email);
    await sendEmail(request.data.email, 'PASSWORD_RESET', ['User', link]);
    return { success: true };
  } catch (error: any) {
    logger.error('Password reset error:', error);
    throw new HttpsError(
      'internal',
      error.message || 'Failed to send password reset email'
    );
  }
}
