import { getAuth } from 'firebase-admin/auth';
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { PasswordResetData } from '../../utils/types';
import { sendEmail } from '../../services/emailService';
import { FieldIssue } from '../../utils/types';
import { isValidEmail } from '../../utils/validators';

export interface SendPasswordResetResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function sendPasswordResetHandler(
  request: CallableRequest<PasswordResetData>
): Promise<SendPasswordResetResult> {
  const issues: FieldIssue[] = [];

  if (!request.data.email) {
    issues.push({ field: 'email', message: 'Email required' });
  }
  if (!isValidEmail(request.data.email)) {
    issues.push({ field: 'email', message: 'Invalid email format' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    const link = await getAuth().generatePasswordResetLink(request.data.email);
    await sendEmail(request.data.email, 'PASSWORD_RESET', ['User', link]);
    return { success: true };
  } catch (error: any) {
    logger.error('Password reset error:', error);
    return {
      success: false,
      issues: [
        {
          field: 'general',
          message: error.message || 'Failed to send password reset email',
        },
      ],
    };
  }
}
