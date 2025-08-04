import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { EmailTemplateKey } from '../../utils/types';
import { sendEmail } from '../../services/emailService';
import { ActionCodeSettings } from 'firebase-admin/auth';
import { auth } from 'firebase-admin';
import { isValidEmail } from '../../utils/validators';
const actionCodeSettings: ActionCodeSettings = {
  url: 'https://your-app.domain.com/finishSignUp', // your front‑end URL
  handleCodeInApp: true,
};

export interface VerificationRequest {
  email: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
}
export async function sendVerificationEmailHandler(
  request: CallableRequest<VerificationRequest>
): Promise<VerificationResult> {
  const { email } = request.data;

  // Validate input
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email address is required.');
  }
  if (isValidEmail(email)) {
    throw new HttpsError('invalid-argument', 'Email address is not correct.');
  }
  // Generate the email verification link
  let link: string;
  try {
    link = await auth().generateEmailVerificationLink(
      email,
      actionCodeSettings
    );
    logger.log('Generated email verification link for', email);
  } catch (err: any) {
    logger.error('Error generating email verification link:', err);
    throw new HttpsError(
      'internal',
      'Failed to generate email verification link.'
    );
  }

  // Send the email via your helper
  try {
    const displayName = email.split('@')[0];
    const templateKey: EmailTemplateKey = 'VERIFICATION';
    await sendEmail(email, templateKey, [displayName, link]);
    logger.log(`Verification email sent to ${email}`);
  } catch (err: any) {
    logger.error('Failed to send verification email:', err);
    throw new HttpsError('internal', 'Failed to send verification email.');
  }

  return {
    success: true,
    message: `Verification email sent to ${email}.`,
  };
}
