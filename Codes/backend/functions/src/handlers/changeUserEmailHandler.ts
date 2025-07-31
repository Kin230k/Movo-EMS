import { getAuth } from 'firebase-admin/auth';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { sendEmail } from '../services/emailService';

export interface ChangeEmailData {
  newEmail: string;
}
export interface ChangeEmailResult {
  success: true;
}

export async function changeUserEmailHandler(
  request: CallableRequest<ChangeEmailData>
): Promise<ChangeEmailResult> {
  // 1) auth check
  if (!request.auth) {
    throw new HttpsError(
      'permission-denied',
      'Must be signed in to change email'
    );
  }

  const uid = request.auth.uid;
  const { newEmail } = request.data;

  if (!newEmail) {
    throw new HttpsError('invalid-argument', 'newEmail is required');
  }

  // 2) fetch old user
  let beforeUser;
  try {
    beforeUser = await getAuth().getUser(uid);
  } catch {
    throw new HttpsError('not-found', 'User not found');
  }

  // 3) update in Auth
  try {
    await getAuth().updateUser(uid, { email: newEmail });
  } catch (err: any) {
    logger.error('Auth update error:', err);
    throw new HttpsError('internal', 'Failed to update auth email');
  }

  // 4) notify old email
  if (beforeUser.email) {
    try {
      await sendEmail(beforeUser.email, 'EMAIL_CHANGE', [
        beforeUser.displayName ?? 'User',
        newEmail,
      ]);
    } catch (err: any) {
      logger.error('Email notification error:', err);
      // swallow
    }
  }

  // 5) (optional) update Postgres here…
  return { success: true };
}
