import { getAuth } from 'firebase-admin/auth';
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { sendEmail } from '../../services/emailService';
import { FieldIssue } from '../../utils/types';
import { isValidEmail } from '../../utils/validators';
import { UserService } from '../../models/auth/user/user.service';
import { firebaseUidToUuid } from '../../utils/firebaseUidToUuid';
import { authenticateCaller } from '../../utils/authUtils';

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

  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

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
    // Update auth email
    await getAuth().updateUser(uid, { email: newEmail });

    await UserService.changeEmail(firebaseUidToUuid(uid), newEmail);
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
