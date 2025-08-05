import { getAuth } from 'firebase-admin/auth';
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { sendEmail } from '../../services/emailService';
import { FieldIssue } from '../../utils/types';
import { isValidEmail } from '../../utils/validators';

export interface ChangeEmailData {
  newEmail: string;
}
export interface ChangeEmailResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function changeUserEmailHandler(
  request: CallableRequest<ChangeEmailData>
): Promise<ChangeEmailResult> {
  const issues: FieldIssue[] = [];

  if (!request.auth) {
    issues.push({
      field: 'auth',
      message: 'Must be signed in to change email',
    });
  }

  if (!request.data.newEmail) {
    issues.push({ field: 'newEmail', message: 'newEmail is required' });
  }
  if (!isValidEmail(request.data.newEmail)) {
    issues.push({ field: 'newEmail', message: 'Invalid newEmail format' });
  }
  if (issues.length > 0) {
    return { success: false, issues };
  }

  const uid = request.auth!.uid;
  const { newEmail } = request.data;

  let beforeUser;
  try {
    beforeUser = await getAuth().getUser(uid);
  } catch (error: any) {
    logger.error('User fetch error:', error);
    return {
      success: false,
      issues: [{ field: 'uid', message: 'User not found' }],
    };
  }

  try {
    await getAuth().updateUser(uid, { email: newEmail });
  } catch (error: any) {
    logger.error('Auth update error:', error);
    return {
      success: false,
      issues: [
        {
          field: 'newEmail',
          message: error.message || 'Failed to update auth email',
        },
      ],
    };
  }

  if (beforeUser.email) {
    try {
      await sendEmail(beforeUser.email, 'EMAIL_CHANGE', [
        beforeUser.displayName ?? 'User',
        newEmail,
      ]);
    } catch (error: any) {
      logger.error('Email notification error:', error);
    }
  }

  return { success: true };
}
