import { getAuth } from 'firebase-admin/auth';
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { LoginAlertData } from '../../utils/types';
import { sendEmail } from '../../services/emailService';
import { FieldIssue } from '../../utils/types';
import { authenticateCaller } from '../../utils/authUtils';

export interface SendLoginAlertResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function sendLoginAlertHandler(
  request: CallableRequest<LoginAlertData>
): Promise<SendLoginAlertResult> {
  const issues: FieldIssue[] = [];

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    const user = await getAuth().getUser(request.auth!.uid);
    if (!user.email) {
      return {
        success: false,
        issues: [{ field: 'email', message: 'User email missing' }],
      };
    }

    const deviceInfo = request.data.device || 'Unknown device';
    await sendEmail(user.email, 'LOGIN_ALERT', [
      user.displayName || 'User',
      deviceInfo,
    ]);

    return { success: true };
  } catch (error: any) {
    logger.error('Login alert error:', error);
    return {
      success: false,
      issues: [
        {
          field: 'general',
          message: error.message || 'Login notification failed',
        },
      ],
    };
  }
}
