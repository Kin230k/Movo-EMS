import { getAuth } from 'firebase-admin/auth';
import { sendEmail } from '../utils/emailService';
import * as functions from 'firebase-functions';

export interface ChangeEmailData {
  newEmail: string;
}
export interface ChangeEmailResult {
  success: true;
}

export async function changeUserEmailHandler(
  data: ChangeEmailData,
  context: functions.https.CallableContext
): Promise<ChangeEmailResult> {
  // 1) auth check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Must be signed in to change email'
    );
  }
  const uid = context.auth.uid;
  const { newEmail } = data;
  if (!newEmail) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'newEmail is required'
    );
  }

  // 2) fetch old user
  let beforeUser;
  try {
    beforeUser = await getAuth().getUser(uid);
  } catch {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  // 3) update in Auth
  try {
    await getAuth().updateUser(uid, { email: newEmail });
  } catch (err: any) {
    functions.logger.error('Auth update error:', err);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update auth email'
    );
  }

  // 4) notify old email
  if (beforeUser.email) {
    try {
      await sendEmail(beforeUser.email, 'EMAIL_CHANGE', [
        beforeUser.displayName ?? 'User',
        newEmail,
      ]);
    } catch (err: any) {
      functions.logger.error('Email notification error:', err);
      // swallow
    }
  }

  // 5) (optional) update Postgres here…

  return { success: true };
}
