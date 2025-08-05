import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { EmailTemplateKey } from '../../utils/types';
import { sendEmail } from '../../services/emailService';
import { ActionCodeSettings } from 'firebase-admin/auth';
import { auth } from 'firebase-admin';
import { isValidEmail } from '../../utils/validators';
import { FieldIssue } from '../../utils/types';

const actionCodeSettings: ActionCodeSettings = {
  url: process.env.urlFinishSignUp ?? '',
  handleCodeInApp: true,
};

export interface VerificationRequest {
  email: string;
}

export interface VerificationResult {
  success: boolean;
  issues?: FieldIssue[];
  message?: string;
}

export async function sendVerificationEmailHandler(
  request: CallableRequest<VerificationRequest>
): Promise<VerificationResult> {
  const issues: FieldIssue[] = [];
  const { email } = request.data;

  if (!email) {
    issues.push({ field: 'email', message: 'Email address is required.' });
  } else if (!isValidEmail(email)) {
    issues.push({ field: 'email', message: 'Email address is not correct.' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  let link: string;
  try {
    link = await auth().generateEmailVerificationLink(
      email,
      actionCodeSettings
    );
    logger.log('Generated email verification link for', email);
  } catch (error: any) {
    logger.error('Error generating email verification link:', error);
    return {
      success: false,
      issues: [
        {
          field: 'general',
          message: 'Failed to generate email verification link.',
        },
      ],
    };
  }

  try {
    const displayName = email.split('@')[0];
    const templateKey: EmailTemplateKey = 'VERIFICATION';
    await sendEmail(email, templateKey, [displayName, link]);
    logger.log(`Verification email sent to ${email}`);
    return {
      success: true,
      message: `Verification email sent to ${email}.`,
    };
  } catch (error: any) {
    logger.error('Failed to send verification email:', error);
    return {
      success: false,
      issues: [
        { field: 'general', message: 'Failed to send verification email.' },
      ],
    };
  }
}
