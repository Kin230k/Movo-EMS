import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { EmailTemplateKey } from '../../utils/types';
import { sendEmail } from '../../services/emailService';
import { ActionCodeSettings } from 'firebase-admin/auth';
import { auth } from 'firebase-admin';
import { isValidEmail } from '../../utils/validators';
import { FieldIssue } from '../../utils/types';
import { authenticateCaller } from '../../utils/authUtils';

const actionCodeSettings: ActionCodeSettings = {
  url: process.env.URL_FINISH_SIGNUP ?? '',
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

  // Get UID from authenticated caller context
  const authz = await authenticateCaller(request);
  if (!authz.success) return authz;
  const uid = request.auth!.uid;

  if (!email) {
    issues.push({ field: 'email', message: 'Email address is required.' });
  } else if (!isValidEmail(email)) {
    issues.push({ field: 'email', message: 'Email address is not correct.' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    // Fetch user from Firebase Auth by UID
    const userRecord = await auth().getUser(uid!);

    if (userRecord.email !== email) {
      return {
        success: false,
        issues: [
          {
            field: 'email',
            message: 'Provided email does not match your registered email.',
          },
        ],
      };
    }

    const link = await auth().generateEmailVerificationLink(
      email,
      actionCodeSettings
    );
    logger.log('Generated email verification link for', email);

    const displayName = email.split('@')[0];
    const templateKey: EmailTemplateKey = 'VERIFICATION';
    await sendEmail(email, templateKey, [displayName, link]);
    logger.log(`Verification email sent to ${email}`);

    return {
      success: true,
      message: `Verification email sent to ${email}.`,
    };
  } catch (error: any) {
    logger.error('Error in sendVerificationEmailHandler:', error);
    return {
      success: false,
      issues: [
        { field: 'general', message: 'Failed to send verification email.' },
      ],
    };
  }
}
